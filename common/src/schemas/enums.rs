use std::{
    fmt::{self, Display},
    str::FromStr,
};

use serde::{Deserialize, Serialize};
use sqlx::Type as SqlxType;

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "filetype", rename_all = "lowercase")]
pub enum FileType {
    Pdf,
    Png,
    Jpg,

    #[serde(skip)]
    #[sqlx(skip)]
    Webp,
}

impl FileType {
    #[must_use]
    pub fn to_mime(&self) -> &str {
        match self {
            Self::Pdf => "application/pdf",
            Self::Png => "image/png",
            Self::Jpg => "image/jpeg",

            Self::Webp => "image/webp",
        }
    }
}

impl Display for FileType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Pdf => write!(f, "pdf"),
            Self::Png => write!(f, "png"),
            Self::Jpg => write!(f, "jpg"),

            Self::Webp => write!(f, "t.webp"),
        }
    }
}

impl FromStr for FileType {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s.to_lowercase().as_str() {
            "png" => FileType::Png,
            "jpg" | "jpeg" | "jfif" => FileType::Jpg,
            "pdf" => FileType::Pdf,
            _ => return Err("Invalid file extension"),
        })
    }
}

#[derive(Debug, Deserialize, Clone, Copy, Eq, PartialEq, PartialOrd, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "order_status", rename_all = "lowercase")]
pub enum OrderStatus {
    Building,
    Reviewing,
    Processing,
    Ready,
    Completed,
    Rejected,
    Cancelled,
}

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "paper_orientation", rename_all = "lowercase")]
pub enum PaperOrientation {
    Portrait,
    Landscape,
}

#[derive(Debug, Deserialize, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "camelCase")]
#[sqlx(type_name = "service_type", rename_all = "snake_case")]
pub enum ServiceType {
    Binding,
    BindingWithCover,
    Laminate,
}

#[derive(Debug, Clone, Copy, Serialize, SqlxType)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Student,
    Teacher,
    Merchant,
}
