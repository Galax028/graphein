use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::schemas::{
    FileId, PaperSizeId,
    enums::{FileType, PaperOrientation},
};

#[derive(Debug, Deserialize, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct File {
    id: FileId,
    filename: String,
    filetype: FileType,
    filesize: i64,
    copies: i32,
    range: Option<String>,
    paper_size_id: Option<PaperSizeId>,
    paper_orientation: PaperOrientation,
    is_colour: bool,
    scaling: i32,
    is_double_sided: bool,
}

#[derive(Debug, Deserialize)]
pub struct FileCreate {
    filename: String,
    filetype: String,
    filesize: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileUploadResponse {
    id: FileId,
    object_key: String,
    upload_url: String,
}
