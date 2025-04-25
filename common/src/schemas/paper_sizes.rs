use std::future;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};

use crate::{
    AppError,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
};

#[derive(Debug, FromRow, Serialize, Table)]
#[table(name = "paper_sizes", primary_key = "i32")]
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

impl ModelVariant<PaperSizesTable> for DefaultPaperSize {
    fn from_model(
        _: &mut PgConnection,
        row: PaperSizesTable,
        _: FetchLevel,
    ) -> impl Future<Output = Result<Self, AppError>> {
        future::ready(Ok(Self {
            id: row.id,
            name: row.name,
            length: row.length,
            width: row.width,
            is_default: row.is_default,
            is_available: row.is_available,
        }))
    }
}

pub type PaperSize = Model<PaperSizesTable, DefaultPaperSize, DefaultPaperSize>;
