use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{File, FileCreate, OrderId, Service, UserId, enums::OrderStatus};

#[derive(Debug, Serialize)]
pub struct ClientOrdersGlance {
    pub ongoing: Vec<CompactOrder>,
    pub finished: Vec<CompactOrder>,
}

#[derive(Debug, Serialize)]
pub struct MerchantOrdersGlance {
    pub incoming: Vec<CompactOrder>,
    pub accepted: Vec<CompactOrder>,
    pub finished: Vec<CompactOrder>,
}

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompactOrder {
    pub id: OrderId,
    pub created_at: DateTime<Utc>,
    pub order_number: String,
    pub status: OrderStatus,
    pub files_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DetailedOrder {
    pub id: OrderId,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner_id: Option<UserId>,
    pub order_number: String,
    pub status: OrderStatus,
    pub price: Option<i64>,
    pub notes: Option<String>,
    pub status_history: Vec<OrderStatusUpdate>,
    pub files: Vec<File>,
    pub services: Vec<Service>,
}

#[derive(Debug, FromRow, Serialize)]
pub struct OrderStatusUpdate {
    #[sqlx(rename = "created_at")]
    pub(crate) timestamp: DateTime<Utc>,
    pub(crate) status: OrderStatus,
}

#[derive(Debug, Deserialize)]
pub struct OrderCreate {
    pub notes: Option<String>,
    pub files: Vec<FileCreate>,
    pub services: Vec<Service>,
}
