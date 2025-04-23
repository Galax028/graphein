use serde::Deserialize;

use crate::FetchLevel;

#[derive(Debug, Clone, Copy, Deserialize)]
pub struct PaginationRequest {
    pub size: i64,
    pub page: i64,
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
