use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{
    BindingColourId, BindingId, FileId, PaperId, PaperVariantId, enums::ServiceType,
};

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
pub struct Paper {
    id: PaperId,
    name: String,
    length: i32,
    width: i32,
    is_default: bool,
    variants: Vec<PaperVariant>,
}

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperVariant {
    id: PaperVariantId,
    name: String,
    is_default: bool,
    is_available: bool,
    is_laminatable: bool,
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
