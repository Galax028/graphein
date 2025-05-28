use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{
    FileId, PaperSizeId,
    enums::{FileType, PaperOrientation},
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
    pub(crate) copies: i32,
    pub(crate) range: Option<String>,
    pub(crate) paper_size_id: Option<PaperSizeId>,
    pub(crate) paper_orientation: PaperOrientation,
    pub(crate) is_colour: bool,
    pub(crate) scaling: i32,
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
    pub copies: i32,
    pub range: Option<String>,
    pub paper_size_id: PaperSizeId,
    pub paper_orientation: PaperOrientation,
    pub is_colour: bool,
    pub scaling: i32,
    pub is_double_sided: bool,
}

#[derive(Debug, Serialize)]
pub struct FilePresignResponse {
    pub id: FileId,
    pub url: String,
}
