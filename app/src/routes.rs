use axum::{Router, routing::get};

use graphein_common::{AppError, AppState, error::NotFoundError};

mod auth;
mod events;
mod merchant;
mod opts;
mod orders;
mod user;

#[doc(hidden)]
pub fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .nest("/auth", auth::expand_router(state.clone()))
        .nest("/user", user::expand_router(state.clone()))
        .nest("/orders", orders::expand_router(state.clone()))
        .nest("/merchant", merchant::expand_router(state.clone()))
        .nest("/opts", opts::expand_router(state.clone()))
        .nest("/events", events::expand_router(state))
        .fallback(get(async || {
            AppError::NotFound(NotFoundError::PathNotFound)
        }))
}
