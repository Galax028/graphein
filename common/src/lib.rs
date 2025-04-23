#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(
    async_fn_in_trait,
    clippy::missing_errors_doc,
    clippy::missing_panics_doc,
    clippy::similar_names
)]

pub mod auth;
pub mod database;
pub mod error;
pub mod extract;
pub mod request;
pub mod response;

pub(crate) mod config;
pub(crate) mod state;

pub use crate::{config::Config, error::AppError, state::AppState};

pub type HandlerResult<T> = Result<T, error::AppError>;
pub type HandlerResponse<T> = Result<response::ResponseBody<T>, error::AppError>;
pub type SqlxResult<T> = Result<T, sqlx::Error>;

pub(crate) use dto::{FetchLevel, IdOnly};

pub mod dto {
    use serde::{Deserialize, Serialize};
    use uuid::Uuid;

    pub use crate::{
        request::{PaginationRequest, RequestData},
        response::{PaginationResponse, ResponseBody},
    };

    #[derive(Debug, Default, Clone, Copy, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub enum FetchLevel {
        #[default]
        IdOnly,
        Compact,
        Default,
    }

    #[derive(Debug, Clone, Copy, Serialize)]
    pub struct IdOnly<Id: Serialize = Uuid> {
        pub id: Id,
    }
}
