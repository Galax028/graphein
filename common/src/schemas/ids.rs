use derive_more::{From, Into};
use serde::{Deserialize, Serialize};
use sqlx::Type as SqlxType;
use uuid::Uuid;

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct BookbindingTypeId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct FileId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct PaperSizeId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Into, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct OrderId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct UserId(Uuid);
