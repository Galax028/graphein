use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
pub struct PaperSizesTable {
    pub id: i32,
    pub created_at: DateTime<Utc>,
    pub name: String,
    pub length: i32,
    pub width: i32,
    pub is_default: bool,
    pub is_available: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultPaperSize {
    id: i32,
    name: String,
    length: i32,
    width: i32,
    is_default: bool,
    is_available: bool,
}
