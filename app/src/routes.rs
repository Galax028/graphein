use std::time::Duration;

use axum::{
    Router,
    extract::{Request, State},
    response::Response,
    routing::get,
};
use http::{HeaderValue, Method};
use serde::Deserialize;
use tower_http::{
    cors::{AllowHeaders, CorsLayer},
    trace::TraceLayer,
};

use graphein_common::{
    AppError, AppState, HandlerResponse, error::NotFoundError, extract::QsQuery,
    response::ResponseBuilder,
};
use tracing::Span;

mod auth;
mod events;
mod merchant;
mod opts;
mod orders;
mod user;

#[doc(hidden)]
#[allow(clippy::needless_pass_by_value)]
pub fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/_internal/healthcheck", get(get_healthcheck))
        .nest("/auth", auth::expand_router(state.clone()))
        .nest("/user", user::expand_router(state.clone()))
        .nest("/orders", orders::expand_router(state.clone()))
        .nest("/merchant", merchant::expand_router(state.clone()))
        .nest("/opts", opts::expand_router(state.clone()))
        .nest("/events", events::expand_router(state.clone()))
        .fallback(get(async || {
            AppError::NotFound(NotFoundError::PathNotFound)
        }))
        .route_layer(
            CorsLayer::new()
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                .allow_origin(
                    state
                        .config
                        .frontend_uri()
                        .parse::<HeaderValue>()
                        .expect("Invalid value for environment variable `FRONTEND_URI`"),
                )
                .allow_headers(AllowHeaders::mirror_request())
                .allow_credentials(true),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request| {
                    tracing::info_span!(
                        "handler",
                        method = %request.method(),
                        uri = %request.uri(),
                        status = tracing::field::Empty,
                        latency = tracing::field::Empty,
                    )
                })
                .on_response(|response: &Response, latency: Duration, _: &Span| {
                    tracing::info!(
                        status = %response.status(),
                        latency = ?latency,
                        "responded",
                    );
                }),
        )
}

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
struct HealthCheckQueryParams {
    token: String,
}

async fn get_healthcheck(
    State(AppState {
        config, ref pool, ..
    }): State<AppState>,
    QsQuery(HealthCheckQueryParams { ref token }): QsQuery<HealthCheckQueryParams>,
) -> HandlerResponse<&'static str> {
    if token != config.healthcheck_token() {
        return Err(AppError::NotFound(NotFoundError::PathNotFound));
    }

    sqlx::query("SELECT 1").execute(pool).await?;

    Ok(ResponseBuilder::new().data("ok").build())
}
