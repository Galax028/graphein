use chrono::{FixedOffset, Utc};
use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{Settings, SettingsUpdate},
};

pub struct SettingsTable;

impl SettingsTable {
    #[tracing::instrument(skip_all, err)]
    pub(crate) async fn fetch(conn: &mut PgConnection) -> SqlxResult<Settings> {
        sqlx::query_as(
            "\
            SELECT \
                latest_orders_flushed_at, is_accepting, is_lamination_serviceable, open_time,\
                close_time \
            FROM settings\
            ",
        )
        .fetch_one(conn)
        .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn check_is_accepting(conn: &mut PgConnection, tz: &FixedOffset) -> SqlxResult<bool> {
        sqlx::query_scalar(
            "\
            SELECT EXISTS (\
                SELECT FROM settings \
                WHERE is_accepting = true AND open_time <= $1 AND close_time > $1\
            )\
            ",
        )
        .bind(Utc::now().with_timezone(tz).time())
        .fetch_one(conn)
        .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn update(
        conn: &mut PgConnection,
        settings: &SettingsUpdate,
    ) -> SqlxResult<Settings> {
        sqlx::query_as(
            "\
            UPDATE settings SET \
                is_accepting = $1, is_lamination_serviceable = $2, open_time = $3, close_time = $4 \
            RETURNING *\
            ",
        )
        .bind(settings.is_accepting)
        .bind(settings.is_lamination_serviceable)
        .bind(settings.open_time)
        .bind(settings.close_time)
        .fetch_one(conn)
        .await
    }

    #[tracing::instrument(skip_all, err)]
    pub(crate) async fn set_latest_orders_flushed_at(conn: &mut PgConnection) -> SqlxResult<()> {
        let now = Utc::now();
        sqlx::query("UPDATE settings SET updated_at = $1, latest_orders_flushed_at = $1")
            .bind(now)
            .execute(conn)
            .await?;

        Ok(())
    }
}
