use chrono::{DateTime, NaiveTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub(crate) latest_orders_flushed_at: Option<DateTime<Utc>>,
    pub(crate) is_accepting: bool,
    pub(crate) is_lamination_serviceable: bool,
    pub(crate) open_time: NaiveTime,
    pub(crate) close_time: NaiveTime,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsUpdate {
    pub is_accepting: bool,
    pub is_lamination_serviceable: bool,
    pub open_time: NaiveTime,
    pub close_time: NaiveTime,
}
