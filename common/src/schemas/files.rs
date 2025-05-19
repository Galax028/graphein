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
