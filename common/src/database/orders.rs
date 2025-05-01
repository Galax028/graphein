use chrono::Utc;
use sqlx::{PgConnection, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::{
    AppError, SqlxResult,
    auth::Session,
    dto::{PaginationRequest, PaginationResponse},
    error::ForbiddenError,
    request::PageKey,
    schemas::{
        CompactOrder, DetailedOrder, OrderId,
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
                status AS \"status: OrderStatus\", price, notes \
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
                f.paper_orientation, f.is_color, f.scaling, f.is_double_sided \
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
            notes: order.notes,
            status_history,
            files,
            services,
        })
    }

    #[must_use]
    pub fn query_compact<'args>() -> CompactOrdersQuery<'args> {
        let query = "\
            SELECT o.id, o.created_at, o.order_number, o.status, COUNT(f.id) AS files_count \
            FROM orders AS o \
                JOIN files AS f ON f.order_id = o.id \
            WHERE \
        ";

        CompactOrdersQuery {
            qb: QueryBuilder::new(query),
            count_qb: None,
            statuses: &[],
            limit: None,
            pagination: None,
        }
    }

    #[must_use]
    pub fn permissions_checker(order_id: OrderId, session: Session) -> OrderPermissionsChecker {
        OrderPermissionsChecker {
            order_id,
            session,
            allow_merchant: false,
        }
    }
}

pub struct CompactOrdersQuery<'args> {
    qb: QueryBuilder<'args, Postgres>,
    count_qb: Option<QueryBuilder<'args, Postgres>>,
    statuses: &'args [OrderStatus],
    limit: Option<i64>,
    pagination: Option<&'args PaginationRequest>,
}

impl<'args> CompactOrdersQuery<'args> {
    fn push_sep<'a>(
        first_bind: &mut bool,
        qb: &'a mut QueryBuilder<'args, Postgres>,
    ) -> &'a mut QueryBuilder<'args, Postgres> {
        if *first_bind {
            *first_bind = false;
        } else {
            qb.push(" AND ");
        }

        qb
    }

    pub fn bind_statuses(&mut self, statuses: &'args [OrderStatus]) -> &mut Self {
        self.statuses = statuses;

        self
    }

    pub fn with_limit(&mut self, limit: i64) -> &mut Self {
        self.limit = Some(limit);

        self
    }

    pub fn with_pagination(&mut self, pagination: &'args PaginationRequest) -> &mut Self {
        self.count_qb = Some(QueryBuilder::new(
            "SELECT COUNT(o.id) FROM orders AS o WHERE ",
        ));
        self.pagination = Some(pagination);

        self
    }

    #[allow(clippy::cast_possible_wrap)]
    fn build<'a>(
        &mut self,
        first_bind: &'a mut bool,
        qb: Option<&'a mut QueryBuilder<'args, Postgres>>,
    ) {
        let is_main_qb = qb.is_none();
        let qb = qb.unwrap_or(&mut self.qb);

        if !self.statuses.is_empty() {
            let statuses = self.statuses;
            Self::push_sep(first_bind, qb)
                .push("o.status = ANY(")
                .push_bind(statuses)
                .push(')');
        }

        if let (Some(PaginationRequest { page, .. }), true) = (self.pagination, is_main_qb) {
            Self::push_sep(first_bind, qb)
                .push("(o.created_at, o.id) < (")
                .push_bind(page.map(|page| page.timestamp()).unwrap_or(Utc::now()))
                .push(',')
                .push_bind(page.map(|page| page.id()).unwrap_or(Uuid::max()))
                .push(')');
        }

        if is_main_qb {
            qb.push(" GROUP BY o.id, o.created_at, o.order_number, o.status");
        }

        match (self.pagination, is_main_qb) {
            (Some(PaginationRequest { size, .. }), true) => {
                qb.push(" ORDER BY o.created_at DESC, o.id DESC LIMIT ")
                    .push_bind(size.get() as i64);
            }
            (None, true) => {
                qb.push(" ORDER BY o.created_at DESC");
            }
            _ => {}
        }

        if let (Some(limit), true) = (self.limit, is_main_qb) {
                qb.push(" LIMIT ")
                .push_bind(limit);
        }
    }

    pub async fn fetch_all(&mut self, conn: &mut PgConnection) -> SqlxResult<Vec<CompactOrder>> {
        assert!(
            !(self.limit.is_some() && self.pagination.is_some()),
            "\
            `CompactOrdersQuery` does not allow the usage of both `.with_limit()` and \
            `.with_pagination()` options simultaneously\
            ",
        );

        let mut first_bind = true;
        self.build(&mut first_bind, None);

        self.qb.build_query_as().fetch_all(conn).await
    }

    pub async fn fetch_paginated(
        &mut self,
        conn: &mut PgConnection,
    ) -> SqlxResult<(Vec<CompactOrder>, PaginationResponse)> {
        assert!(
            self.pagination.is_some(),
            "\
            `CompactOrdersQuery` does not allow calling `.fetch_paginated()` if \
            `.with_pagination()` has not been called\
            ",
        );

        let mut first_bind = true;
        let mut count_qb = self.count_qb.take().unwrap();
        self.build(&mut first_bind, Some(&mut count_qb));
        let rows = self.fetch_all(&mut *conn).await?;

        let prev = self.pagination.and_then(|p| p.page);
        let next = rows
            .last()
            .map(|last| PageKey::new(last.created_at, last.id.into()));
        let size = rows.len();
        let count: i64 = count_qb.build_query_scalar().fetch_one(&mut *conn).await?;

        Ok((rows, PaginationResponse::new(prev, next, size, count)))
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
