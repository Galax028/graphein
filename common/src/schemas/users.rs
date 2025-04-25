use std::future;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgConnection};
use uuid::Uuid;

use crate::{
    AppError, SqlxResult,
    database::{
        Table,
        model::{Model, ModelVariant},
    },
    dto::FetchLevel,
    schemas::enums::UserRole,
};

#[derive(Debug, FromRow, Serialize, Table)]
#[table(name = "users")]
pub struct UsersTable {
    pub id: Uuid,
    pub created_at: DateTime<Utc>,
    pub role: UserRole,
    pub email: String,
    pub name: String,
    pub tel: Option<String>,
    pub class: Option<i16>,
    pub class_no: Option<i16>,
    pub profile_url: String,
    pub is_onboarded: bool,
}

impl UsersTable {
    /// Creates a new **un-onboarded** user returning their ID.
    pub async fn create_new(
        conn: &mut PgConnection,
        role: UserRole,
        email: &str,
        name: &str,
        profile_url: &str,
    ) -> SqlxResult<Uuid> {
        let row = sqlx::query!(
            "\
            INSERT INTO users (role, email, name, profile_url)\
            VALUES ($1, $2, $3, $4) RETURNING id\
            ",
            role as UserRole,
            email,
            name,
            profile_url,
        )
        .fetch_one(conn)
        .await?;

        Ok(row.id)
    }

    /// Fetch a single record from the `UsersTable` by email, returning `None` if not found.
    pub async fn fetch_by_email(conn: &mut PgConnection, email: &str) -> SqlxResult<Option<Self>> {
        sqlx::query_as("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(conn)
            .await
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DefaultUser {
    id: Uuid,
    role: UserRole,
    email: String,
    name: String,
    tel: Option<String>,
    class: Option<i16>,
    class_no: Option<i16>,
    profile_url: String,
    is_onboarded: bool,
}

impl ModelVariant<UsersTable> for DefaultUser {
    fn from_model(
        _: &mut PgConnection,
        row: UsersTable,
        _: FetchLevel,
    ) -> impl Future<Output = Result<Self, AppError>> {
        future::ready(Ok(Self {
            id: row.id,
            role: row.role,
            email: row.email,
            name: row.name,
            tel: row.tel,
            class: row.class,
            class_no: row.class_no,
            profile_url: row.profile_url,
            is_onboarded: row.is_onboarded,
        }))
    }
}

pub type User = Model<UsersTable, DefaultUser, DefaultUser>;
