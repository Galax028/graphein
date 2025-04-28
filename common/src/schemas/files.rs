use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::{
    SqlxResult,
    schemas::enums::{FileType, PaperOrientation},
};

#[derive(Debug, FromRow)]
pub struct FilesTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub file_id: String,
    pub filename: String,
    pub filetype: FileType,
    pub order_id: Uuid,
    pub copies: i32,
    pub range: Option<String>,
    pub paper_size_id: Option<i32>,
    pub paper_orientation: PaperOrientation,
    pub is_color: bool,
    pub scaling: i32,
    pub is_double_sided: bool,
    pub notes: Option<String>,
}

impl FilesTable {
    pub async fn count_files_by_order_id(
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> SqlxResult<i64> {
        sqlx::query_scalar("SELECT COUNT(id) FROM files WHERE order_id = $1")
            .bind(order_id)
            .fetch_one(conn)
            .await
    }

    pub async fn fetch_all_by_order_id(
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> SqlxResult<Vec<FilesTable>> {
        sqlx::query_as("SELECT * FROM files WHERE order_id = $1 ORDER BY created_at ASC")
            .bind(order_id)
            .fetch_all(conn)
            .await
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultFile {
    id: Uuid,
    filename: String,
    filetype: FileType,
    // order: OrdersTable,
    copies: i32,
    range: Option<String>,
    // paper_size: Option<PaperSize>,
    paper_orientation: PaperOrientation,
    is_color: bool,
    scaling: i32,
    is_double_sided: bool,
    notes: Option<String>,
}
