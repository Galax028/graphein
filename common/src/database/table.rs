use serde::Serialize;
use sqlx::{
    Encode, FromRow, PgConnection, Postgres,
    postgres::{PgHasArrayType, PgRow},
};
use uuid::Uuid;

use crate::SqlxResult;

extern crate graphein_codegen;
pub use graphein_codegen::Table;

pub trait Table<PK = Uuid>
where
    Self: for<'r> FromRow<'r, PgRow> + Send + Sized + Unpin,
    Self::PK: for<'r> Encode<'r, Postgres> + PgHasArrayType + Serialize + sqlx::Type<Postgres>,
{
    /// The name of the table.
    const TABLE_NAME: &'static str;

    /// The type of the primary key column.
    type PK;

    fn id(self) -> Self::PK;

    async fn fetch_one(conn: &mut PgConnection, id: Self::PK) -> SqlxResult<Self> {
        let query = format!("SELECT * FROM {} WHERE id = $1", Self::TABLE_NAME);

        sqlx::query_as(&query).bind(id).fetch_one(&mut *conn).await
    }

    async fn fetch_all(conn: &mut PgConnection, ids: Vec<Self::PK>) -> SqlxResult<Vec<Self>> {
        let query = format!("SELECT * FROM {} WHERE id = ANY($1)", Self::TABLE_NAME);

        sqlx::query_as(&query).bind(ids).fetch_all(&mut *conn).await
    }
}
