use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::schemas::{BindingColourId, BindingId, FileId, enums::ServiceType};

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Service {
    pub(crate) r#type: ServiceType,
    pub(crate) binding_colour_id: Option<BindingColourId>,
    pub(crate) notes: Option<String>,
    pub(crate) file_ids: Vec<FileId>,
}

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Binding {
    id: BindingId,
    name: String,
    is_available: bool,
    colours: Vec<BindingColour>,
}

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BindingColour {
    id: BindingColourId,
    colour: String,
    is_available: bool,
}
