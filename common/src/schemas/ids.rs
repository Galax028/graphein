use derive_more::{From, Into};
use serde::{Deserialize, Serialize};
use sqlx::Type as SqlxType;
use uuid::Uuid;

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct BindingId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct BindingColourId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct FileId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct FileRangeId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct PaperId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct PaperVariantId(i32);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, Into, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct OrderId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct ServiceId(Uuid);

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, Hash, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct UserId(Uuid);
