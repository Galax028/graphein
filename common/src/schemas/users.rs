use regex::Regex;
use serde::{Deserialize, Deserializer, Serialize, de};
use sqlx::{FromRow, Type as SqlxType};

use crate::schemas::{enums::UserRole, UserId};

#[derive(Debug, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: UserId,
    role: UserRole,
    email: String,
    name: String,
    tel: Option<Tel>,
    class: Option<i16>,
    class_no: Option<i16>,
    profile_url: String,
    is_onboarded: bool,
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
            .unwrap()
            .is_match(&inner);

        if is_valid_tel {
            Ok(Tel(inner))
        } else {
            Err(de::Error::custom("Invalid phone number format"))
        }
    }
}
