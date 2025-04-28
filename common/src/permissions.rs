use sqlx::PgConnection;
use uuid::Uuid;

use crate::{AppError, auth::Session, error::ForbiddenError, schemas::enums::UserRole};

impl Session {
    pub async fn assert_read_order(
        &self,
        conn: &mut PgConnection,
        order_id: Uuid,
    ) -> Result<(), AppError> {
        let user_role: UserRole = sqlx::query_scalar("SELECT role FROM users WHERE user_id = $1")
            .bind(self.user_id)
            .fetch_one(&mut *conn)
            .await?;

        if matches!(user_role, UserRole::Merchant) {
            return Ok(());
        }

        let is_owner: bool = sqlx::query_scalar(
            "SELECT EXISTS (SELECT 1 FROM orders WHERE id = $1 AND owner_id = $2)",
        )
        .bind(order_id)
        .bind(self.user_id)
        .fetch_one(&mut *conn)
        .await?;

        if is_owner {
            Ok(())
        } else {
            Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions))
        }
    }

    pub async fn assert_read_bulk_orders(
        &self,
        conn: &mut PgConnection,
        order_ids: &[Uuid],
    ) -> Result<(), AppError> {
        let user_role: UserRole = sqlx::query_scalar("SELECT role FROM users WHERE user_id = $1")
            .bind(self.user_id)
            .fetch_one(&mut *conn)
            .await?;

        if matches!(user_role, UserRole::Merchant) {
            return Ok(());
        }

        let offset = (order_ids.len() - 1) as i64;
        let is_owner: bool = sqlx::query_scalar(
            "\
            SELECT EXISTS (\
                SELECT 1 FROM orders WHERE id = ANY($1) AND owner_id = $2 LIMIT 1 OFFSET $3\
            )\
            ",
        )
        .bind(order_ids)
        .bind(self.user_id)
        .bind(offset)
        .fetch_one(&mut *conn)
        .await?;

        if is_owner {
            Ok(())
        } else {
            Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions))
        }
    }
}
