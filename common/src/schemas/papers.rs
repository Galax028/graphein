use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type as SqlxType};

use crate::schemas::{PaperId, PaperVariantId};

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperWithoutVariants {
    pub id: PaperId,
    pub name: String,
    pub length: i32,
    pub width: i32,
    pub is_default: bool,
}

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
pub struct PaperUpdate {
    pub name: String,
    pub length: i32,
    pub width: i32,
    pub is_default: bool,
}

#[derive(Debug, FromRow, Serialize, SqlxType)]
#[serde(rename_all = "camelCase")]
#[sqlx(type_name = "paper_variant")]
pub struct PaperVariant {
    pub id: PaperVariantId,
    pub name: String,
    pub is_default: bool,
    pub is_available: bool,
    pub is_laminatable: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaperVariantCreate {
    pub name: String,
    pub is_default: bool,
    pub is_available: bool,
    pub is_laminatable: bool,
}
