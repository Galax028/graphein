use axum::{Router, routing::get};

use graphein_common::{AppError, AppState, error::NotFoundError};

mod auth;
mod events;
mod merchant;
mod opts;
mod orders;
mod user;

#[doc(hidden)]
pub fn expand_router() -> Router<AppState> {
    Router::new()
        .nest("/auth", auth::expand_router())
        .nest("/user", user::expand_router())
        .nest("/orders", orders::expand_router())
        .nest("/merchant", merchant::expand_router())
        .nest("/opts", opts::expand_router())
        .nest("/events", events::expand_router())
        .fallback(get(async || {
            AppError::NotFound(NotFoundError::PathNotFound)
        }))
}
