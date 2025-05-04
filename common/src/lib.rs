#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(
    async_fn_in_trait,
    clippy::missing_errors_doc,
    clippy::missing_panics_doc,
    clippy::similar_names
)]

pub mod auth;
pub mod daemons;
pub mod database;
pub mod error;
pub mod extract;
pub mod middleware;
pub mod request;
pub mod response;
pub mod schemas;

pub(crate) mod config;
pub(crate) mod state;

pub use crate::{
    config::Config,
    error::AppError,
    state::{AppState, GOOGLE_SIGNING_KEYS, R2Bucket},
};

pub type HandlerResponse<T> = Result<response::ResponseBody<T>, error::AppError>;
pub type SqlxResult<T> = Result<T, sqlx::Error>;

pub mod dto {
    pub use crate::{
        request::{PaginationRequest, RequestData},
        response::{PaginationResponse, ResponseBody},
    };
}
