use std::sync::Arc;

use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type as SqlxType};

use crate::schemas::{
    FileId, PaperVariantId,
    enums::{FileType, PaperOrientation},
    ids::FileRangeId,
};

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct File {
    pub(crate) id: FileId,
    pub(crate) filename: String,
    pub(crate) filetype: FileType,
    pub(crate) filesize: i64,
    #[serde(skip_serializing)]
    pub(crate) object_key: String,
    pub(crate) ranges: Vec<FileRange>,
}

#[derive(Debug, Deserialize, FromRow, Serialize, SqlxType)]
#[serde(rename_all = "camelCase")]
#[sqlx(type_name = "file_range")]
pub struct FileRange {
    pub(crate) id: FileRangeId,
    pub(crate) range: Option<String>,
    pub(crate) copies: i32,
    pub(crate) paper_variant_id: Option<PaperVariantId>,
    pub(crate) paper_orientation: PaperOrientation,
    pub(crate) is_colour: bool,
    pub(crate) is_double_sided: bool,
}

#[derive(Debug, FromRow)]
pub struct FileMetadata {
    pub id: FileId,
    pub object_key: String,
    pub filename: String,
    pub filetype: FileType,
}

#[derive(Debug, Deserialize)]
pub struct FileUploadCreate {
    pub filetype: FileType,
    pub filesize: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileUploadResponse {
    pub id: FileId,
    pub object_key: String,
    pub upload_url: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileCreate {
    pub id: FileId,
    pub filename: String,
    pub ranges: Vec<FileRangeCreate>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileRangeCreate {
    pub range: Option<String>,
    pub copies: i32,
    pub paper_variant_id: PaperVariantId,
    pub paper_orientation: PaperOrientation,
    pub is_colour: bool,
    pub is_double_sided: bool,
}

#[derive(Debug, Serialize)]
pub struct FilePresignResponse {
    pub id: FileId,
    pub url: Arc<str>,
}
