#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]

use anyhow::{Context as _, Result};
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use tokio::{net::TcpListener, runtime::Handle};
use tracing::{debug, info};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use graphein_app::expand_router;
use graphein_common::{AppState, Config, R2Bucket, Thumbnailer, daemons::DaemonController};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::builder().parse(
            #[cfg(debug_assertions)]
            "graphein_app=debug,graphein_common=debug,sqlx=trace,tower_http=trace",
            #[cfg(not(debug_assertions))]
            "graphein_app=info,graphein_common=info,sqlx=warn,tower_http=warn",
        )?)
        .with(tracing_subscriber::fmt::layer())
        .try_init()?;

    let config = Config::try_from_dotenv().context("Failed to parse config")?;
    let (host, port, root_uri) = (config.host(), config.port(), config.root_uri());

    let pool = PgPoolOptions::new()
        .connect_with(config.database_connect_options()?)
        .await?;
    sqlx::migrate!("../.sqlx/migrations").run(&pool).await?;

    let bucket = R2Bucket::new(
        config.r2_account_id().to_owned(),
        config.r2_bucket_name().to_owned(),
        config.r2_access_key_id(),
        config.r2_secret_access_key(),
    )?;

    let (thumbnailer, thumbnailer_rx) = Thumbnailer::new();

    let app_state = AppState::new(config.clone(), pool, bucket, thumbnailer);
    app_state.load_sessions().await?;

    let daemon_controller =
        DaemonController::new(app_state.clone()).start_all(Handle::current(), thumbnailer_rx);

    let app = Router::new()
        .merge(expand_router(app_state.clone()))
        .with_state(app_state.clone());

    let listener = TcpListener::bind((host, port)).await?;
    info!(
        "sk-online-printing (`graphein`) server version {}",
        env!("CARGO_PKG_VERSION")
    );
    info!("server is listening on http://{}", listener.local_addr()?);
    debug!("quick login: {root_uri}/auth/google/init");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal(daemon_controller, app_state))
        .await?;

    Ok(())
}

async fn shutdown_signal(daemon_controller: DaemonController, app_state: AppState) {
    let sigint_handle = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install `SIGINT` handler");
    };

    #[cfg(unix)]
    let sigterm_handle = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install `SIGTERM` handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let sigterm_handle = std::future::pending::<()>();

    tokio::select! {
        () = sigint_handle => info!("stopping server due to user interruption"),
        () = sigterm_handle => info!("stopping server due to system termination"),
    }

    daemon_controller.stop_all();
    app_state
        .sessions
        .commit(app_state.pool)
        .await
        .expect("Unable to commit sessions to database");
}
