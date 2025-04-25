use chrono::{DateTime, Utc};
use futures::{StreamExt as _, TryStreamExt as _, stream};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::{
    AppError,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
    schemas::{
        File, FilesTable, OrderStatusUpdate, OrderStatusUpdatesTable, User, enums::OrderStatus,
    },
};

#[derive(Debug, FromRow, Table)]
#[table(name = "orders")]
pub struct OrdersTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub owner_id: Uuid,
    pub order_number: String,
    pub price: Option<i64>,
    pub status: OrderStatus,
}

impl OrdersTable {
    const START: &str = "SELECT * FROM orders WHERE ";
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactOrder {
    id: Uuid,
    created_at: DateTime<Utc>,
    order_number: String,
    status: OrderStatus,
    files_count: i64,
}

impl ModelVariant<OrdersTable> for CompactOrder {
    async fn from_model(
        conn: &mut PgConnection,
        row: OrdersTable,
        _: FetchLevel,
    ) -> Result<Self, AppError> {
        let files_count = FilesTable::count_files_by_order_id(conn, row.id).await?;

        Ok(Self {
            id: row.id,
            created_at: row.created_at,
            order_number: row.order_number,
            status: row.status,
            files_count,
        })
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultOrder {
    id: Uuid,
    created_at: DateTime<Utc>,
    owner: User,
    order_number: String,
    price: Option<i64>,
    status: OrderStatus,
    status_updates: Vec<OrderStatusUpdate>,
    // files: Vec<File>,
}

impl ModelVariant<OrdersTable> for DefaultOrder {
    async fn from_model(
        conn: &mut PgConnection,
        row: OrdersTable,
        descendant_fetch_level: FetchLevel,
    ) -> Result<Self, AppError> {
        let owner = User::fetch_one(conn, row.owner_id)
            .await?
            .into_model_variant(conn, descendant_fetch_level, FetchLevel::default())
            .await?;

        let status_updates = OrderStatusUpdatesTable::fetch_all_by_order_id(conn, row.id)
            .await?
            .iter()
            .map(OrderStatusUpdate::from_model)
            .collect();

        // let files = stream::iter(FilesTable::fetch_all_by_order_id(conn, row.id).await?)
        //     .then(|file| async move {
        //         file.into_model_variant(&mut *conn, descendant_fetch_level, FetchLevel::default())
        //             .await
        //     })
        //     .try_collect::<Vec<_>>()
        //     .await?;

        Ok(Self {
            id: row.id,
            created_at: row.created_at,
            owner,
            order_number: row.order_number,
            price: row.price,
            status: row.status,
            status_updates,
            // files,
        })
    }
}

pub type Order = Model<OrdersTable, CompactOrder, DefaultOrder>;
