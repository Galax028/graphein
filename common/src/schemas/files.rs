use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::{
    AppError, SqlxResult,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
    schemas::{
        BookbindingType, Order, PaperSize,
        enums::{FileType, PaperOrientation},
    },
};

#[derive(Debug, FromRow, Table)]
#[table(name = "files")]
pub struct FilesTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub order_id: Uuid,
    pub copies: i32,
    pub range: Option<String>,
    pub paper_size_id: Option<i32>,
    pub paper_orientation: PaperOrientation,
    pub is_colour: bool,
    pub scaling: i32,
    pub double_sided: bool,
    pub bookbinding_type_id: Option<i32>,
    pub notes: Option<String>,
    pub file_id: String,
    pub filename: String,
    pub filetype: FileType,
}

impl FilesTable {
    /// Counts the number of files associated with the given order ID.
    pub async fn count_files_by_order_id(
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> SqlxResult<i64> {
        sqlx::query_scalar("SELECT COUNT(id) FROM files WHERE order_id = $1")
            .bind(order_id)
            .fetch_one(conn)
            .await
    }
}

impl FilesTable {
    /// Fetches all record related to given order ID, returning an empty `Vec` if none were found.
    pub async fn fetch_all_by_order_id(
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> SqlxResult<Vec<File>> {
        Ok(
            sqlx::query_as("SELECT * FROM files WHERE order_id = $1 ORDER BY created_at ASC")
                .bind(order_id)
                .fetch_all(conn)
                .await?
                .into_iter()
                .map(File::Raw)
                .collect(),
        )
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultFile {
    id: Uuid,
    order: Order,
    copies: i32,
    range: Option<String>,
    paper_size: Option<PaperSize>,
    paper_orientation: PaperOrientation,
    is_colour: bool,
    scaling: i32,
    double_sided: bool,
    bookbinding_type: Option<BookbindingType>,
    notes: Option<String>,
    filename: String,
    filetype: FileType,
}

impl ModelVariant<FilesTable> for DefaultFile {
    async fn from_model(
        conn: &mut PgConnection,
        row: FilesTable,
        descendant_fetch_level: FetchLevel,
    ) -> Result<Self, AppError> {
        let order = Order::fetch_one(conn, row.order_id)
            .await?
            .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
            .await?;

        let paper_size = if let Some(paper_size_id) = row.paper_size_id {
            Some(
                PaperSize::fetch_one(conn, paper_size_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            )
        } else {
            None
        };

        let bookbinding_type = if let Some(bookbinding_type_id) = row.bookbinding_type_id {
            Some(
                BookbindingType::fetch_one(conn, bookbinding_type_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            )
        } else {
            None
        };

        Ok(Self {
            id: row.id,
            order,
            copies: row.copies,
            range: row.range,
            paper_size,
            paper_orientation: row.paper_orientation,
            is_colour: row.is_colour,
            scaling: row.scaling,
            double_sided: row.double_sided,
            bookbinding_type,
            notes: row.notes,
            filename: row.filename,
            filetype: row.filetype,
        })
    }
}

pub type File = Model<FilesTable, DefaultFile, DefaultFile>;
