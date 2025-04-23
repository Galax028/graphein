use axum::response::{IntoResponse, Response};
use chrono::{DateTime, Utc};
use serde::Serialize;

use crate::extract::Json;

#[derive(Debug, Clone, Copy, Serialize)]
pub struct PaginationResponse {
    current: i64,
    last: i64,
    size: i64,
    count: i64,
}

impl PaginationResponse {
    #[must_use]
    pub fn new(current: i64, last: i64, size: i64, count: i64) -> Self {
        Self {
            current,
            last,
            size,
            count,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ResponseBody<T: Serialize> {
    success: bool,
    timestamp: DateTime<Utc>,
    message: Option<String>,
    data: Option<T>,
    error: Option<String>,
    pagination: Option<PaginationResponse>,
}

impl<T: Serialize> IntoResponse for ResponseBody<T> {
    fn into_response(self) -> Response {
        Json(self).into_response()
    }
}

#[derive(Debug)]
pub struct ResponseBuilder<T: Serialize> {
    success: bool,
    message: Option<String>,
    data: Option<T>,
    error: Option<String>,
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
            success: true,
            message: None,
            data: None,
            error: None,
            pagination: None,
        }
    }

    #[must_use]
    pub fn message(mut self, message: String) -> Self {
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
    pub fn new_error(error: String, message: String) -> Self {
        Self {
            success: false,
            message: Some(message),
            data: None,
            error: Some(error),
            pagination: None,
        }
    }
}
