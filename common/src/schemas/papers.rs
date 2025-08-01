use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type as SqlxType};

use crate::schemas::{PaperId, PaperVariantId};

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Paper {
    pub id: PaperId,
    pub name: String,
    pub length: i32,
    pub width: i32,
    pub is_default: bool,
    pub variants: Vec<PaperVariant>,
}

#[derive(Debug, FromRow, Serialize, SqlxType)]
#[serde(rename_all = "camelCase")]
#[sqlx(type_name = "paper_variant")]
pub struct PaperVariant {
    id: PaperVariantId,
    name: String,
    is_default: bool,
    is_available: bool,
    is_laminatable: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperCreate {
    pub name: String,
    pub length: i32,
    pub width: i32,
    pub is_default: bool,
    pub variants: Vec<PaperVariantCreate>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperVariantCreate {
    pub(crate) name: String,
    pub(crate) is_default: bool,
    pub(crate) is_available: bool,
    pub(crate) is_laminatable: bool,
}
