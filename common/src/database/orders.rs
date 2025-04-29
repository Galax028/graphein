use sqlx::PgConnection;
use uuid::Uuid;

use crate::{
    AppError, SqlxResult,
    auth::Session,
    error::ForbiddenError,
    schemas::{
        DetailedOrder, OrderId,
        enums::{OrderStatus, UserRole},
    },
};

pub struct OrdersTable;

impl OrdersTable {
    pub async fn fetch_one(conn: &mut PgConnection, id: OrderId) -> SqlxResult<DetailedOrder> {
        let order = sqlx::query!(
            "\
            SELECT
                id AS \"id: OrderId\", created_at, order_number,\
                status AS \"status: OrderStatus\", price \
            FROM orders WHERE id = $1\
            ",
            Uuid::from(id),
        )
        .fetch_one(&mut *conn)
        .await?;

        let status_history = sqlx::query_as(
            "\
            SELECT u.created_at AS timestamp, u.status \
            FROM order_status_updates AS u \
                JOIN orders AS o ON o.id = u.order_id \
            WHERE u.order_id = $1 \
                ORDER BY u.created_at\
            ",
        )
        .bind(id)
        .fetch_all(&mut *conn)
        .await?;

        let files = sqlx::query_as(
            "\
            SELECT \
                f.id, f.filename, f.filetype, f.filesize, f.copies, f.range, f.paper_size_id,\
                f.paper_orientation, f.is_color, f.scaling, f.is_double_sided, f.notes \
            FROM files AS f \
                JOIN orders AS o ON o.id = f.order_id \
            WHERE f.order_id = $1 \
                ORDER BY f.index\
            ",
        )
        .bind(id)
        .fetch_all(&mut *conn)
        .await?;

        let services = sqlx::query_as(
            "\
            SELECT \
                s.service_type, s.bookbinding_type_id, s.notes,\
                ARRAY_AGG(f.id ORDER BY f.index) AS file_ids \
            FROM services AS s \
                JOIN orders AS o ON o.id = s.order_id \
                JOIN services_files AS sf ON sf.order_id = o.id AND sf.service_id = s.id \
                JOIN files AS f ON f.id = sf.file_id \
            WHERE s.order_id = $1 \
                GROUP BY s.index, s.service_type, s.bookbinding_type_id, s.notes \
                ORDER BY s.index\
            ",
        )
        .bind(id)
        .fetch_all(conn)
        .await?;

        Ok(DetailedOrder {
            id: order.id,
            created_at: order.created_at,
            order_number: order.order_number,
            status: order.status,
            price: order.price,
            status_history,
            files,
            services,
        })
    }

    #[must_use]
    pub fn permissions_checker(
        order_id: OrderId,
        session: Session,
    ) -> OrderPermissionsChecker {
        OrderPermissionsChecker {
            order_id,
            session,
            allow_merchant: false,
        }
    }
}

pub struct OrderPermissionsChecker {
    order_id: OrderId,
    session: Session,
    allow_merchant: bool,
}

impl OrderPermissionsChecker {
    pub fn allow_merchant(mut self, allow_merchant: bool) -> Self {
        self.allow_merchant = allow_merchant;

        self
    }

    pub async fn test(self, conn: &mut PgConnection) -> Result<(), AppError> {
        if self.allow_merchant && matches!(self.session.user_role, UserRole::Merchant) {
            return Ok(());
        }

        let is_owner = sqlx::query_scalar(
            "SELECT EXISTS (SELECT 1 FROM orders WHERE id = $1 AND owner_id = $2)",
        )
        .bind(self.order_id)
        .bind(self.session.user_id)
        .fetch_one(conn)
        .await?;

        if is_owner {
            Ok(())
        } else {
            Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions))
        }
    }
}
