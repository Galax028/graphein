use derive_more::From;
use serde::{Deserialize, Serialize};
use sqlx::Type as SqlxType;
use uuid::Uuid;

#[derive(Clone, Copy, Debug, Deserialize, Eq, From, PartialEq, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct UserId(Uuid);
