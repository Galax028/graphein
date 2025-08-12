use std::error::Error as _;

use axum::{
    extract::{
        FromRef, FromRequestParts, OptionalFromRequest, Request,
        rejection::{JsonRejection, PathRejection},
    },
    response::IntoResponse,
};
use axum_extra::extract::CookieJar;
use axum_macros::FromRequest;
use http::request::Parts;
use serde::{Serialize, de::DeserializeOwned};
use serde_qs::axum::QsQueryRejection;

use crate::{
    AppState,
    auth::{Session, SessionStore},
    error::{AppError, AuthError, BadRequestError},
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

impl<T, S> OptionalFromRequest<S> for Json<T>
where
    axum::Json<T>: OptionalFromRequest<S>,
    AppError: From<<axum::Json<T> as OptionalFromRequest<S>>::Rejection>,
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(req: Request, state: &S) -> Result<Option<Self>, Self::Rejection> {
        <axum::Json<T> as OptionalFromRequest<S>>::from_request(req, state)
            .await
            .map(|value| value.map(|axum::Json(value)| Json(value)))
            .map_err(From::from)
    }
}

impl<T: Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> axum::response::Response {
        let Self(value) = self;
        axum::Json(value).into_response()
    }
}

impl From<PathRejection> for AppError {
    fn from(rejection: PathRejection) -> Self {
        BadRequestError::MalformedPath(rejection.body_text()).into()
    }
}

impl From<QsQueryRejection> for AppError {
    fn from(rejection: QsQueryRejection) -> Self {
        BadRequestError::MalformedQuery(
            rejection
                .source()
                .map_or(String::from("unknown"), ToString::to_string),
        )
        .into()
    }
}

impl From<JsonRejection> for AppError {
    fn from(rejection: JsonRejection) -> Self {
        BadRequestError::MalformedJson(rejection.body_text().into()).into()
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

        let cookies = CookieJar::from_request_parts(parts, state).await.unwrap(); // Infallible
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
