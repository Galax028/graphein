use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::schemas::{
    BookbindingType, Order, PaperSize, User,
    enums::{FileType, PaperOrientation},
};
use graphein_common::{
    AppError,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
};

#[derive(Debug, FromRow, Table)]
#[table(name = "files")]
pub(crate) struct FilesTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub owner_id: Option<Uuid>,
    pub order_id: Option<Uuid>,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DefaultFile {
    id: Uuid,
    owner: Option<User>,
    order: Option<Order>,
    copies: i32,
    range: Option<String>,
    paper_size: Option<PaperSize>,
    paper_orientation: PaperOrientation,
    is_colour: bool,
    scaling: i32,
    double_sided: bool,
    bookbinding_type: Option<BookbindingType>,
    notes: Option<String>,
    file_id: String,
    filename: String,
    filetype: FileType,
}

impl ModelVariant<FilesTable> for DefaultFile {
    async fn from_model(
        conn: &mut PgConnection,
        row: FilesTable,
        descendant_fetch_level: FetchLevel,
    ) -> Result<Self, AppError> {
        let owner = match row.owner_id {
            Some(owner_id) => Some(
                User::fetch_one(conn, owner_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            ),
            None => None,
        };

        let order = match row.order_id {
            Some(order_id) => Some(
                Order::fetch_one(conn, order_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            ),
            None => None,
        };

        let paper_size = match row.paper_size_id {
            Some(paper_size_id) => Some(
                PaperSize::fetch_one(conn, paper_size_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            ),
            None => None,
        };

        let bookbinding_type = match row.bookbinding_type_id {
            Some(bookbinding_type_id) => Some(
                BookbindingType::fetch_one(conn, bookbinding_type_id)
                    .await?
                    .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
                    .await?,
            ),
            None => None,
        };

        Ok(Self {
            id: row.id,
            owner,
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
            file_id: row.file_id,
            filename: row.filename,
            filetype: row.filetype,
        })
    }
}

pub(crate) type File = Model<FilesTable, DefaultFile, DefaultFile>;
