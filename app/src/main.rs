#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]

use anyhow::{Context as _, Result};
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use tokio::{net::TcpListener, runtime::Handle};
#[cfg(debug_assertions)]
use tracing_subscriber::Layer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use graphein_app::expand_router;
use graphein_common::{AppState, Config, R2Bucket, Thumbnailer, daemons::DaemonController};

#[tokio::main]
async fn main() -> Result<()> {
    #[cfg(debug_assertions)]
    let tracing_registry = tracing_subscriber::registry().with(
        console_subscriber::ConsoleLayer::builder()
            .with_default_env()
            .spawn()
            .with_filter(
                tracing_subscriber::EnvFilter::builder().parse("tokio=trace,runtime=trace")?,
            ),
    );
    #[cfg(not(debug_assertions))]
    let tracing_registry = tracing_subscriber::registry();
    tracing_registry
        .with(tracing_subscriber::fmt::layer().with_filter(
            tracing_subscriber::EnvFilter::builder().parse(
                #[cfg(debug_assertions)]
                "graphein_app=debug,graphein_common=debug,sqlx=trace,tower_http=trace",
                #[cfg(not(debug_assertions))]
                "graphein_app=info,graphein_common=info,sqlx=warn,tower_http=warn",
            )?,
        ))
        .try_init()?;

    let config = Config::try_from_dotenv().context("Failed to parse config")?;
    let (host, port, root_uri) = (config.host(), config.port(), config.root_uri());

    tracing::info!("Trying to establish a database connection pool...");
    let pool = PgPoolOptions::new()
        .connect_with(config.database_connect_options()?)
        .await
        .context("Failed to establish a connection pool with the database")?;
    tracing::info!("Established a database connection pool successfully");

    if config.no_migrate() {
        tracing::warn!("`NO_MIGRATE` set to true, skipping database migrations");
    } else {
        tracing::info!("Running database migrations...");
        sqlx::migrate!("../.sqlx/migrations")
            .run(&pool)
            .await
            .context("Failed to run database migrations")?;
        tracing::info!("Ran database migrations successfully");
    }

    let (thumbnailer, thumbnailer_rx) = Thumbnailer::new();

    let app_state = AppState::new(
        config.clone(),
        pool,
        R2Bucket::new(
            config.r2_account_id().to_owned(),
            config.r2_bucket_name().to_owned(),
            config.r2_access_key_id(),
            config.r2_secret_access_key(),
        )?,
        thumbnailer,
    );
    app_state.load_sessions().await?;

    let daemon_controller =
        DaemonController::new(app_state.clone()).start_all(Handle::current(), thumbnailer_rx);

    let app = Router::new()
        .merge(expand_router(app_state.clone()))
        .with_state(app_state.clone());

    let listener = TcpListener::bind((host, port)).await?;
    tracing::info!(
        "sk-printing-facility (`graphein`) server version {}",
        env!("CARGO_PKG_VERSION"),
    );
    tracing::info!("Server is listening on http://{}", listener.local_addr()?);
    tracing::debug!("Quick login: {root_uri}/auth/google/init");
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
        () = sigint_handle => tracing::info!("stopping server due to user interruption"),
        () = sigterm_handle => tracing::info!("stopping server due to system termination"),
    }

    daemon_controller.stop_all();
    app_state
        .sessions
        .commit(app_state.pool)
        .await
        .expect("Unable to commit sessions to database");
}
