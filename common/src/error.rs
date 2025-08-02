use std::borrow::Cow;

use anyhow::anyhow;
use axum::response::{IntoResponse, Response};
use http::StatusCode;
use sqlx::postgres::PgDatabaseError;
use thiserror::Error;

use crate::response::ResponseBuilder;

#[cfg(not(debug_assertions))]
static UNEXPECTED_ERR: &str = "An unexpected error had occurred on the server.";

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{0}")]
    BadRequest(#[from] BadRequestError),

    #[error("{0}")]
    Unauthorized(#[from] AuthError),

    #[error("{0}")]
    Forbidden(#[from] ForbiddenError),

    #[error("{0}")]
    NotFound(#[from] NotFoundError),

    #[error("{0}")]
    DatabaseError(Cow<'static, str>),

    #[cfg(debug_assertions)]
    #[error("[other] {0}")]
    InternalServerError(#[from] anyhow::Error),

    #[cfg(not(debug_assertions))]
    #[error("[500] {}", UNEXPECTED_ERR)]
    InternalServerError(#[from] anyhow::Error),

    #[error("[503] Service currently unavailable.")]
    TimeoutError,
}

#[derive(Debug, Error)]
pub enum BadRequestError {
    #[error("[4001] {0}.")]
    MalformedPath(String),

    #[error("[4002] {0}.")]
    MalformedQuery(String),

    #[error("[4003] {0}.")]
    MalformedJson(Cow<'static, str>),

    #[error("[4004] Request data is missing required field(s).")]
    MissingFields,

    #[error("[4005] Cannot process status updates for this order any further.")]
    UnprocessableStatusUpdate,

    #[error("[4006] {0}")]
    MalformedFiles(&'static str),
}

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("[4010] Corrupted or improper authorization data was provided.")]
    Unprocessable,

    #[error("[4011] Invalid or improper OAuth flow.")]
    InvalidOAuthFlow,

    #[error("[4012] Invalid authorization scheme was provided.")]
    InvalidAuthScheme,

    #[error("[4013] Invalid authorization token was provided.")]
    InvalidAuthToken,

    #[error("[4014] Session ID was either invalid or missing.")]
    MissingAuth,
}

#[derive(Debug, Error)]
pub enum ForbiddenError {
    #[error("[4031] User must complete the onboarding process to perform this action.")]
    OnboardingRequired,

    #[error("[4032] Non-organization users may not sign-up for this service.")]
    NonOrganizationSignup,

    #[error("[4033] Insufficient permissions to access this resource.")]
    InsufficientPermissions,

    #[error("[4034] One or more identical records already exist in the database.")]
    AlreadyExists,

    #[error("[4035] Forbidden to remove one or more records due to constraint violation(s).")]
    DeleteConstraintViolation,
}

#[derive(Debug, Error)]
pub enum NotFoundError {
    #[error("[4041] The requested path was not found.")]
    PathNotFound,

    #[error("[4042] The requested resource was not found.")]
    ResourceNotFound,
}

impl From<reqwest::Error> for AppError {
    fn from(source: reqwest::Error) -> Self {
        AppError::InternalServerError(anyhow!(source))
    }
}

impl From<sqlx::Error> for AppError {
    fn from(source: sqlx::Error) -> Self {
        match source {
            sqlx::Error::Database(database_error) => {
                let database_error = database_error.downcast::<PgDatabaseError>();
                match database_error.code() {
                    "23505" => AppError::Forbidden(ForbiddenError::AlreadyExists),
                    _ => {
                        #[cfg(debug_assertions)]
                        return AppError::DatabaseError(format!("[psql] {database_error}").into());

                        #[cfg(not(debug_assertions))]
                        return AppError::DatabaseError(UNEXPECTED_ERR.into());
                    }
                }
            }
            sqlx::Error::RowNotFound => AppError::NotFound(NotFoundError::ResourceNotFound),
            sqlx::Error::Tls(_) | sqlx::Error::PoolClosed | sqlx::Error::PoolTimedOut => {
                AppError::TimeoutError
            }
            _ => {
                #[cfg(debug_assertions)]
                return AppError::DatabaseError(format!("[sqlx] {source}").into());

                #[cfg(not(debug_assertions))]
                return AppError::DatabaseError(UNEXPECTED_ERR.into());
            }
        }
    }
}

impl From<tokio::task::JoinError> for AppError {
    fn from(source: tokio::task::JoinError) -> Self {
        AppError::InternalServerError(anyhow!(source))
    }
}

impl<T> From<tokio::sync::mpsc::error::SendError<T>> for AppError {
    fn from(_: tokio::sync::mpsc::error::SendError<T>) -> Self {
        AppError::InternalServerError(anyhow!("Channel closed"))
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(_: jsonwebtoken::errors::Error) -> Self {
        AppError::Unauthorized(AuthError::InvalidOAuthFlow)
    }
}

impl From<hex::FromHexError> for AppError {
    fn from(_: hex::FromHexError) -> Self {
        AppError::Unauthorized(AuthError::Unprocessable)
    }
}

impl From<hex::FromHexError> for AuthError {
    fn from(_: hex::FromHexError) -> Self {
        AuthError::Unprocessable
    }
}

impl AppError {
    #[must_use]
    pub fn to_status_code(&self) -> StatusCode {
        match self {
            Self::BadRequest { .. } => StatusCode::BAD_REQUEST,
            Self::Unauthorized { .. } => StatusCode::UNAUTHORIZED,
            Self::Forbidden { .. } => StatusCode::FORBIDDEN,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::DatabaseError { .. } | Self::InternalServerError { .. } => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::TimeoutError => StatusCode::SERVICE_UNAVAILABLE,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status_code = self.to_status_code();

        (
            status_code,
            ResponseBuilder::new_error(
                status_code.canonical_reason().unwrap_or("Unknown").into(),
                self.to_string().into(),
            )
            .build(),
        )
            .into_response()
    }
}
