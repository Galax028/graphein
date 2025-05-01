use std::{
    fmt::{self, Display},
    num::NonZeroU64,
    str::FromStr,
};

use chrono::{DateTime, Utc};
use serde::Deserialize;
use serde_with::{DeserializeFromStr, SerializeDisplay, serde_as};
use uuid::Uuid;

#[derive(Clone, Copy, Debug, DeserializeFromStr, SerializeDisplay)]
pub struct PageKey(DateTime<Utc>, Uuid);

impl PageKey {
    #[must_use]
    pub fn new(timestamp: DateTime<Utc>, id: Uuid) -> Self {
        Self(timestamp, id)
    }

    #[must_use]
    pub fn timestamp(&self) -> DateTime<Utc> {
        self.0
    }

    #[must_use]
    pub fn id(&self) -> Uuid {
        self.1
    }
}

impl FromStr for PageKey {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        static ERROR: &str = "Invalid pagination key";

        let (timestamp, id) = s.split_once('.').ok_or(ERROR)?;

        Ok(Self(
            String::from_utf8(hex::decode(timestamp).map_err(|_| ERROR)?)
                .map_err(|_| ERROR)?
                .parse::<DateTime<Utc>>()
                .map_err(|_| ERROR)?,
            Uuid::try_from(hex::decode(id).map_err(|_| ERROR)?).map_err(|_| ERROR)?,
        ))
    }
}

impl Display for PageKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}.{}",
            hex::encode(self.0.to_rfc3339()),
            hex::encode(self.1)
        )
    }
}

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(default)]
#[serde_as]
pub struct PaginationRequest {
    #[serde_as(as = "TryFromInto<NonZeroI64>")]
    pub size: NonZeroU64,
    pub page: Option<PageKey>,
}

impl Default for PaginationRequest {
    fn default() -> Self {
        Self {
            size: NonZeroU64::new(5).unwrap(),
            page: None,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RequestDataPlaceholder;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestData<T = Option<RequestDataPlaceholder>> {
    #[serde(flatten)]
    pub data: T,

    #[serde(default, flatten)]
    pub pagination: PaginationRequest,
}
