use serde::Serialize;
use sqlx::Type;

#[derive(Debug, Clone, Copy, Serialize, Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "filetype", rename_all = "lowercase")]
pub enum FileType {
    Pdf,
    Png,
    Jpg,
}

#[derive(Debug, Clone, Copy, Serialize, Type)]
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

#[derive(Debug, Clone, Copy, Serialize, Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "paper_orientation", rename_all = "lowercase")]
pub enum PaperOrientation {
    Portrait,
    Landscape,
}

#[derive(Debug, Clone, Copy, Serialize, Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Student,
    Teacher,
    Merchant,
}
