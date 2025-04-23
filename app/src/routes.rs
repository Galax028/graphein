use axum::{
    Router,
    routing::{get, post},
};

use graphein_common::{AppError, AppState, dto::ResponseBody, response::ResponseBuilder};

mod auth;

pub fn expand_router() -> Router<AppState> {
    Router::new()
        .route("/", get(hello_world))
        .route("/auth/self", get(auth::get_user))
        .route("/auth/signout", post(auth::post_signout))
        .route("/auth/google/init", get(auth::get_init_google_oauth))
        .route("/auth/google/code", get(auth::get_finish_google_oauth))
        .merge(expand_auth_debug_router())
        .fallback(get(async || AppError::NotFound {
            message: "The requested path was not found.".to_string(),
        }))
}

#[cfg(debug_assertions)]
fn expand_auth_debug_router() -> Router<AppState> {
    Router::new()
        .route("/auth/debug/session", get(auth::get_debug_session))
        .route("/auth/debug/onboard", get(auth::get_debug_onboard))
}

#[cfg(not(debug_assertions))]
fn expand_auth_debug_router() -> Router<AppState> {
    Router::new()
}

async fn hello_world() -> ResponseBody<&'static str> {
    ResponseBuilder::new().data("Hello, world!").build()
}
