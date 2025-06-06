use std::borrow::Cow;

use axum::response::{IntoResponse, Response};
use chrono::{DateTime, Utc};
use http::StatusCode;
use serde::Serialize;

use crate::{extract::Json, request::PageKey};

#[derive(Debug, Clone, Copy, Serialize)]
pub struct PaginationResponse {
    page: Option<PageKey>,
    size: usize,
    count: i64,
    reverse: bool,
}

impl PaginationResponse {
    #[must_use]
    pub fn new(page: Option<PageKey>, size: usize, count: i64, reverse: bool) -> Self {
        Self {
            page,
            size,
            count,
            reverse,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ResponseBody<T: Serialize> {
    success: bool,
    timestamp: DateTime<Utc>,
    message: Option<Cow<'static, str>>,
    data: Option<T>,
    error: Option<Cow<'static, str>>,
    pagination: Option<PaginationResponse>,

    #[serde(skip)]
    status_code: Option<StatusCode>,
}

impl<T: Serialize> IntoResponse for ResponseBody<T> {
    fn into_response(self) -> Response {
        match self.status_code {
            Some(status_code) => (status_code, Json(self)).into_response(),
            None => Json(self).into_response(),
        }
    }
}

#[derive(Debug)]
pub struct ResponseBuilder<T: Serialize> {
    status_code: Option<StatusCode>,
    success: bool,
    message: Option<Cow<'static, str>>,
    data: Option<T>,
    error: Option<Cow<'static, str>>,
    pagination: Option<PaginationResponse>,
}

impl<T: Serialize> Default for ResponseBuilder<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T: Serialize> ResponseBuilder<T> {
    #[must_use]
    pub fn new() -> Self {
        Self {
            status_code: None,
            success: true,
            message: None,
            data: None,
            error: None,
            pagination: None,
        }
    }

    #[must_use]
    pub fn status_code(mut self, status_code: StatusCode) -> Self {
        self.status_code = Some(status_code);
        self
    }

    #[must_use]
    pub fn message(mut self, message: Cow<'static, str>) -> Self {
        self.message = Some(message);
        self
    }

    #[must_use]
    pub fn data(mut self, data: T) -> Self {
        self.data = Some(data);
        self
    }

    #[must_use]
    pub fn pagination(mut self, pagination: PaginationResponse) -> Self {
        self.pagination = Some(pagination);
        self
    }

    pub fn build(self) -> ResponseBody<T> {
        ResponseBody {
            status_code: self.status_code,
            success: self.success,
            timestamp: Utc::now(),
            message: self.message,
            data: self.data,
            error: self.error,
            pagination: self.pagination,
        }
    }
}

impl ResponseBuilder<()> {
    #[must_use]
    pub fn new_error(error: Cow<'static, str>, message: Cow<'static, str>) -> Self {
        Self {
            status_code: None,
            success: false,
            message: Some(message),
            data: None,
            error: Some(error),
            pagination: None,
        }
    }
}
