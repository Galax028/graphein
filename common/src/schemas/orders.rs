use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

use crate::schemas::{OrderStatusUpdate, enums::OrderStatus};

#[derive(Debug, FromRow)]
pub struct OrdersTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub owner_id: Uuid,
    pub order_number: String,
    pub price: Option<i64>,
    pub status: OrderStatus,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultOrder {
    id: Uuid,
    created_at: DateTime<Utc>,
    // owner: User,
    order_number: String,
    price: Option<i64>,
    status: OrderStatus,
    status_updates: Vec<OrderStatusUpdate>,
    // files: Vec<File>,
}
