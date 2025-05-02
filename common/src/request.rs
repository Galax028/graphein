use std::{
    fmt::{self, Display},
    num::{NonZeroI64, NonZeroU64},
    str::FromStr,
};

use chrono::{DateTime, SecondsFormat, Utc};
use serde::Deserialize;
use serde_with::{DeserializeFromStr, DisplayFromStr, SerializeDisplay, serde_as};
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
            hex::encode(self.0.to_rfc3339_opts(SecondsFormat::Millis, true)),
            hex::encode(self.1)
        )
    }
}

#[derive(Clone, Copy, Debug)]
#[repr(transparent)]
pub struct PageSize(NonZeroU64);

impl PageSize {
    pub fn get(self) -> i64 {
        self.0.get() as i64
    }
}

impl Default for PageSize {
    fn default() -> Self {
        Self(NonZeroU64::new(5).unwrap())
    }
}

impl FromStr for PageSize {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        static ERROR: &str = "Invalid pagination size";
        let parsed: NonZeroU64 = NonZeroI64::from_str(s)
            .map_err(|_| ERROR)?
            .try_into()
            .map_err(|_| ERROR)?;

        if parsed.get() > 50 {
            Err("Invalid pagination size: must be between `1` and `50`")
        } else {
            Ok(Self(parsed))
        }
    }
}

#[serde_as]
#[derive(Debug, Default, Clone, Copy, Deserialize)]
#[serde(default)]
pub struct PaginationRequest {
    #[serde_as(as = "DisplayFromStr")]
    pub size: PageSize,
    pub page: Option<PageKey>,
    #[serde_as(as = "DisplayFromStr")]
    pub reverse: bool,
}

#[derive(Debug, Deserialize)]
pub struct RequestDataPlaceholder;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestData<T = RequestDataPlaceholder> {
    #[serde(flatten)]
    pub data: T,

    #[serde(default, flatten)]
    pub pagination: PaginationRequest,
}
