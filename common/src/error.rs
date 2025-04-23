use anyhow::anyhow;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;
use tracing::error;

use crate::response::ResponseBuilder;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{message}")]
    BadRequest { message: String },

    #[error("{message}")]
    Unauthorized {
        #[from]
        message: AuthError,
    },

    #[error("{message}")]
    Forbidden { message: String },

    #[error("{message}")]
    NotFound { message: String },

    #[error("{message}")]
    DatabaseError { message: String },

    #[cfg(debug_assertions)]
    #[error("[unknown] {message}")]
    InternalServerError {
        #[from]
        message: anyhow::Error,
    },

    #[cfg(not(debug_assertions))]
    #[error("An unexpected error had occurred on the server.")]
    InternalServerError {
        #[from]
        message: anyhow::Error,
    },
}

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Corrupted or improper authorization data was provided.")]
    Unprocessable,

    #[error("Invalid or improper OAuth flow.")]
    InvalidOAuthFlow,

    #[error("Invalid authorization scheme was provided.")]
    InvalidAuthScheme,

    #[error("Invalid authorization token was provided.")]
    InvalidAuthToken,

    #[error("Session ID was either invalid or missing.")]
    MissingAuth,
}

impl From<reqwest::Error> for AppError {
    fn from(source: reqwest::Error) -> Self {
        AppError::InternalServerError {
            message: anyhow!(source),
        }
    }
}

impl From<sqlx::Error> for AppError {
    fn from(source: sqlx::Error) -> Self {
        if matches!(source, sqlx::Error::RowNotFound) {
            AppError::NotFound {
                message: "The requested resource was not found.".to_string(),
            }
        } else {
            #[cfg(debug_assertions)]
            return AppError::DatabaseError {
                message: format!("[sqlx] {source}"),
            };

            #[cfg(not(debug_assertions))]
            return AppError::DatabaseError {
                message: "An unexpected error had occurred on the server.".to_string(),
            };
        }
    }
}

impl From<tokio::task::JoinError> for AppError {
    fn from(source: tokio::task::JoinError) -> Self {
        AppError::InternalServerError {
            message: anyhow!(source),
        }
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(_: jsonwebtoken::errors::Error) -> Self {
        AuthError::InvalidOAuthFlow.into()
    }
}

impl From<hex::FromHexError> for AppError {
    fn from(_: hex::FromHexError) -> Self {
        AuthError::Unprocessable.into()
    }
}

impl From<hex::FromHexError> for AuthError {
    fn from(_: hex::FromHexError) -> Self {
        AuthError::Unprocessable
    }
}

impl AppError {
    fn to_status_code(&self) -> StatusCode {
        match self {
            Self::BadRequest { .. } => StatusCode::BAD_REQUEST,
            Self::Unauthorized { .. } => StatusCode::UNAUTHORIZED,
            Self::Forbidden { .. } => StatusCode::FORBIDDEN,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::DatabaseError { .. } | Self::InternalServerError { .. } => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status_code = self.to_status_code();
        let source = self.to_string();
        if status_code.is_server_error() {
            error!("INTERNAL SERVER ERROR - {source}");
        }

        (
            status_code,
            ResponseBuilder::new_error(status_code.to_string(), source).build(),
        )
            .into_response()
    }
}
