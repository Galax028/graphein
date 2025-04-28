#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]

use anyhow::Result;
use axum::Router;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use tokio::net::TcpListener;
use tokio_util::sync::CancellationToken;
use tower_http::trace::TraceLayer;
use tracing::{debug, info};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use graphein_app::expand_router;
use graphein_common::{AppState, Config, auth::fetch_google_jwks};

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

    let config = Config::try_from_dotenv()?;
    let (host, port, root_uri) = (config.host(), config.port(), config.root_uri().to_owned());
    let pool = PgPoolOptions::new()
        .connect_with(config.database_url().parse::<PgConnectOptions>()?)
        .await?;
    let app_state = AppState::new(config, pool);
    app_state.load_sessions().await;

    let fgj_token = CancellationToken::new();
    tokio::spawn(fetch_google_jwks(app_state.clone(), fgj_token.clone()));

    let app = Router::new()
        .merge(expand_router(app_state.clone()))
        .with_state(app_state.clone())
        .layer(TraceLayer::new_for_http());

    let listener = TcpListener::bind((host, port)).await?;
    info!(
        "sk-online-printing (`graphein`) server version {}",
        env!("CARGO_PKG_VERSION")
    );
    info!("server is listening on http://{}", listener.local_addr()?);
    debug!("quick login: {root_uri}/auth/google/init");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal(fgj_token, app_state))
        .await?;

    Ok(())
}

async fn shutdown_signal(fgj_token: CancellationToken, app_state: AppState) {
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

    fgj_token.cancel();
    app_state.sessions.commit(app_state.pool).await;
}
