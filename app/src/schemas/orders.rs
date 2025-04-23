use std::future;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::schemas::{User, enums::OrderStatus};
use graphein_common::{
    AppError,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
};

#[derive(Debug, FromRow, Table)]
#[table(name = "orders")]
pub(crate) struct OrdersTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub owner_id: Uuid,
    pub order_number: String,
    pub status: OrderStatus,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CompactOrder {
    id: Uuid,
    created_at: DateTime<Utc>,
    order_number: String,
    status: OrderStatus,
}

impl ModelVariant<OrdersTable> for CompactOrder {
    fn from_model(
        _: &mut PgConnection,
        row: OrdersTable,
        _: FetchLevel,
    ) -> impl Future<Output = Result<Self, AppError>> {
        future::ready(Ok(Self {
            id: row.id,
            created_at: row.created_at,
            order_number: row.order_number,
            status: row.status,
        }))
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DefaultOrder {
    id: Uuid,
    created_at: DateTime<Utc>,
    owner: User,
    order_number: String,
    status: OrderStatus,
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

        Ok(Self {
            id: row.id,
            created_at: row.created_at,
            owner,
            order_number: row.order_number,
            status: row.status,
        })
    }
}

pub(crate) type Order = Model<OrdersTable, CompactOrder, DefaultOrder>;
