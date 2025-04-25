use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{PgConnection, prelude::FromRow};
use uuid::Uuid;

use crate::{SqlxResult, schemas::enums::OrderStatus};

#[derive(Debug, FromRow)]
pub struct OrderStatusUpdatesTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub order_id: Uuid,
    pub status: OrderStatus,
}

impl OrderStatusUpdatesTable {
    /// Fetches all record related to given order ID, returning an empty `Vec` if none were found.
    pub async fn fetch_all_by_order_id(
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> SqlxResult<Vec<Self>> {
        sqlx::query_as(
            "SELECT * FROM order_status_updates WHERE order_id = $1 ORDER BY created_at ASC",
        )
        .bind(order_id)
        .fetch_all(conn)
        .await
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderStatusUpdate {
    timestamp: DateTime<Utc>,
    order_id: Uuid,
    status: OrderStatus,
}

impl OrderStatusUpdate {
    #[must_use]
    pub fn from_model(row: &OrderStatusUpdatesTable) -> Self {
        Self {
            timestamp: row.created_at,
            order_id: row.order_id,
            status: row.status,
        }
    }
}
