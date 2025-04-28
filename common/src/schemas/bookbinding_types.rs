use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
pub struct BookbindingTypesTable {
    pub id: i32,
    pub created_at: DateTime<Utc>,
    pub name: String,
    pub is_available: bool,
}
