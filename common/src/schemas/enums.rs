use serde::{Deserialize, Serialize};
use sqlx::Type as SqlxType;

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "filetype", rename_all = "lowercase")]
pub enum FileType {
    Pdf,
    Png,
    Jpg,
}

#[derive(Debug, Deserialize, Clone, Copy, Eq, PartialEq, PartialOrd, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "order_status", rename_all = "lowercase")]
pub enum OrderStatus {
    Building,
    Reviewing,
    Processing,
    Ready,
    Completed,
    Rejected,
    Cancelled,
}

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "paper_orientation", rename_all = "lowercase")]
pub enum PaperOrientation {
    Portrait,
    Landscape,
}

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "camelCase")]
#[sqlx(type_name = "service_type", rename_all = "snake_case")]
pub enum ServiceType {
    Bookbinding,
    BookbindingWithCover,
    Laminate,
}

#[derive(Debug, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Student,
    Teacher,
    Merchant,
}
