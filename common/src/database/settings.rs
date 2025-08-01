use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{IsAcceptingResponse, Settings, SettingsUpdate},
};

pub struct SettingsTable;

impl SettingsTable {
    #[tracing::instrument(skip_all, err)]
    pub async fn check_is_accepting(conn: &mut PgConnection) -> SqlxResult<IsAcceptingResponse> {
        sqlx::query_as("SELECT is_accepting, is_lamination_serviceable FROM settings")
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
}
