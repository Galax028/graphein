use serde::Deserialize;

use crate::FetchLevel;

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(default)]
pub struct PaginationRequest {
    pub size: i64,
    pub page: i64,
}

impl Default for PaginationRequest {
    fn default() -> Self {
        Self { size: 5, page: 1 }
    }
}

#[derive(Debug, Deserialize)]
pub struct RequestDataPlaceholder;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestData<T = Option<RequestDataPlaceholder>> {
    #[serde(default)]
    pub fetch_level: FetchLevel,

    pub data: T,

    #[serde(default)]
    pub pagination: Option<PaginationRequest>,
}
