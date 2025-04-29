use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{File, OrderId, Service, enums::OrderStatus};

#[derive(Debug, Serialize)]
pub struct ClientOrdersGlance {
    ongoing: Vec<CompactOrder>,
    finished: Vec<CompactOrder>,
}

#[derive(Debug, Serialize)]
pub struct MerchantOrdersGlance {
    incoming: Vec<CompactOrder>,
    accepted: Vec<CompactOrder>,
    finished: Vec<CompactOrder>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactOrder {
    id: OrderId,
    created_at: DateTime<Utc>,
    order_number: String,
    status: OrderStatus,
    files_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DetailedOrder {
    pub id: OrderId,
    pub created_at: DateTime<Utc>,
    pub order_number: String,
    pub status: OrderStatus,
    pub price: Option<i64>,
    pub status_history: Vec<OrderStatusUpdate>,
    pub files: Vec<File>,
    pub services: Vec<Service>,
}

#[derive(Debug, FromRow, Serialize)]
pub struct OrderStatusUpdate {
    timestamp: DateTime<Utc>,
    status: OrderStatus,
}

#[derive(Debug)]
pub struct DraftOrder {
    id: OrderId,
    created_at: DateTime<Utc>,
    order_number: String,
    status: OrderStatus,
    status_history: Vec<OrderStatusUpdate>,
}

#[derive(Debug, Deserialize)]
pub struct OrderBuild {
    files: Vec<File>,
    services: Vec<Service>,
}
