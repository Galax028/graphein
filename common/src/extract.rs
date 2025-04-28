use std::error::Error as _;

use axum::{
    extract::{
        FromRef, FromRequestParts,
        rejection::{JsonRejection, PathRejection},
    },
    http::request::Parts,
    response::IntoResponse,
};
use axum_extra::extract::CookieJar;
use axum_macros::FromRequest;
use serde::Serialize;
use serde_qs::axum::QsQueryRejection;

use crate::{
    AppState,
    auth::{Session, SessionStore},
    error::{AppError, AuthError},
};

#[derive(FromRequestParts)]
#[from_request(via(axum::extract::Path), rejection(AppError))]
pub struct Path<T>(pub T);

#[derive(FromRequestParts)]
#[from_request(via(serde_qs::axum::QsQuery), rejection(AppError))]
pub struct QsQuery<T>(pub T);

#[derive(FromRequest)]
#[from_request(via(axum::Json), rejection(AppError))]
pub struct Json<T>(pub T);

impl<T: Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> axum::response::Response {
        let Self(value) = self;
        axum::Json(value).into_response()
    }
}

impl From<PathRejection> for AppError {
    fn from(value: PathRejection) -> Self {
        Self::BadRequest(format!("[4001] {}.", value.body_text()).into())
    }
}

impl From<QsQueryRejection> for AppError {
    fn from(value: QsQueryRejection) -> Self {
        Self::BadRequest(format!("[4002] {}.", value.source().unwrap()).into())
    }
}

impl From<JsonRejection> for AppError {
    fn from(value: JsonRejection) -> Self {
        Self::BadRequest(format!("[4003] {}.", value.body_text()).into())
    }
}

impl FromRef<AppState> for SessionStore {
    fn from_ref(input: &AppState) -> Self {
        input.sessions.clone()
    }
}

impl<S> FromRequestParts<S> for Session
where
    SessionStore: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (CookieJar, AppError);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let rejection = |cookies: CookieJar| {
            (
                cookies.remove("session_token").remove("is_onboarded"),
                AuthError::MissingAuth.into(),
            )
        };

        let cookies = CookieJar::from_request_parts(parts, state).await.unwrap();
        let sessions = SessionStore::from_ref(state);
        let session_id = match cookies.get("session_token") {
            Some(cookie) => cookie.value_trimmed(),
            None => {
                return Err(rejection(cookies));
            }
        };

        sessions
            .get(session_id)
            .await
            .map_err(|_| rejection(cookies))
    }
}
