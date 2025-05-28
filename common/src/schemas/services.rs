use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{BookbindingTypeId, FileId, PaperSizeId, enums::ServiceType};

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Service {
    pub(crate) service_type: ServiceType,
    pub(crate) bookbinding_type_id: Option<BookbindingTypeId>,
    pub(crate) notes: Option<String>,
    pub(crate) file_ids: Vec<FileId>,
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
