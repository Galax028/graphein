use regex::Regex;
use serde::{Deserialize, Deserializer, Serialize, de};
use sqlx::{FromRow, Type as SqlxType};

use crate::schemas::{UserId, enums::UserRole};

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub(crate) id: UserId,
    pub(crate) role: UserRole,
    pub(crate) email: String,
    pub(crate) name: String,
    pub(crate) tel: Option<Tel>,
    pub(crate) class: Option<i16>,
    pub(crate) class_no: Option<i16>,
    pub(crate) profile_url: String,
    pub(crate) is_onboarded: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserUpdate {
    pub tel: Option<Tel>,
    pub class: Option<i16>,
    pub class_no: Option<i16>,
}

#[derive(Debug, Serialize, SqlxType)]
#[repr(transparent)]
#[serde(transparent)]
#[sqlx(transparent)]
pub struct Tel(String);

impl<'de> Deserialize<'de> for Tel {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let inner: String = Deserialize::deserialize(deserializer)?;
        let is_valid_tel = Regex::new(r"^0[6-9][0-9]\-?[0-9]{3}\-?[0-9]{4}$")
            .unwrap() // Infallible
            .is_match(&inner);

        if is_valid_tel {
            Ok(Self(inner))
        } else {
            Err(de::Error::custom("Invalid phone number format"))
        }
    }
}
