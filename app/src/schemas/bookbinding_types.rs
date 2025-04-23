use std::future;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};

use graphein_common::{
    AppError,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
};

#[derive(Debug, FromRow, Serialize, Table)]
#[table(name = "bookbinding_types", primary_key = "i32")]
pub(crate) struct BookbindingTypesTable {
    pub id: i32,
    pub created_at: DateTime<Utc>,
    pub name: String,
    pub is_available: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DefaultBookbindingType {
    id: i32,
    name: String,
    is_available: bool,
}

impl ModelVariant<BookbindingTypesTable> for DefaultBookbindingType {
    fn from_model(
        _: &mut PgConnection,
        row: BookbindingTypesTable,
        _: FetchLevel,
    ) -> impl Future<Output = Result<Self, AppError>> {
        future::ready(Ok(Self {
            id: row.id,
            name: row.name,
            is_available: row.is_available,
        }))
    }
}

pub(crate) type BookbindingType =
    Model<BookbindingTypesTable, DefaultBookbindingType, DefaultBookbindingType>;
