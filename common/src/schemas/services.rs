use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

use crate::schemas::{BookbindingTypeId, PaperSizeId, enums::ServiceType};

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Service {
    service_type: ServiceType,
    bookbinding_type_id: Option<BookbindingTypeId>,
    notes: Option<String>,
    file_ids: Vec<Uuid>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperSize {
    id: PaperSizeId,
    name: String,
    length: i32,
    width: i32,
    is_default: bool,
    is_available: bool,
}

#[derive(Debug, Serialize)]
pub struct BookbindingType {
    id: BookbindingTypeId,
    name: String,
    is_available: bool,
}
