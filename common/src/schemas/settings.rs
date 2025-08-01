use chrono::{DateTime, NaiveTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(skip_serializing)]
    created_at: DateTime<Utc>,
    #[serde(skip_serializing)]
    updated_at: DateTime<Utc>,
    latest_orders_flushed_at: Option<DateTime<Utc>>,
    is_accepting: bool,
    is_lamination_serviceable: bool,
    open_time: NaiveTime,
    close_time: NaiveTime,
}

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IsAcceptingResponse {
    is_accepting: bool,
    is_lamination_serviceable: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsUpdate {
    pub is_accepting: bool,
    pub is_lamination_serviceable: bool,
    pub open_time: NaiveTime,
    pub close_time: NaiveTime,
}
