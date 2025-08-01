use chrono::Utc;
use sqlx::{PgConnection, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::{
    AppError, SqlxResult,
    auth::Session,
    database::UsersTable,
    dto::{PaginationRequest, PaginationResponse},
    error::ForbiddenError,
    request::PageKey,
    schemas::{
        CompactOrder, DetailedOrder, OrderId, OrderStatusUpdate, ServiceId, UserId,
        enums::{OrderStatus, UserRole},
    },
};

pub struct OrdersTable;

impl OrdersTable {
    #[allow(clippy::cast_possible_truncation, clippy::cast_possible_wrap)]
    #[tracing::instrument(skip_all, err)]
    pub async fn create_new(conn: &mut PgConnection, order: &DetailedOrder) -> SqlxResult<()> {
        sqlx::query(
            "\
            INSERT INTO orders (id, created_at, owner_id, order_number, status, notes)\
            VALUES ($1, $2, $3, $4, $5, $6)\
            ",
        )
        .bind(order.id)
        .bind(order.created_at)
        .bind(order.owner_id)
        .bind(order.order_number.as_str())
        .bind(OrderStatus::Reviewing)
        .bind(order.notes.as_ref())
        .execute(&mut *conn)
        .await?;

        sqlx::query(
            "\
            INSERT INTO order_status_updates (created_at, order_id, status)\
            VALUES ($1, $2, $3)\
            ",
        )
        .bind(Utc::now())
        .bind(order.id)
        .bind(OrderStatus::Reviewing)
        .execute(&mut *conn)
        .await?;

        for (index, file) in order.files.iter().enumerate() {
            sqlx::query(
                "\
                INSERT INTO files (id, order_id, object_key, filename, filetype, filesize, index)\
                VALUES ($1, $2, $3, $4, $5, $6, $7)\
                ",
            )
            .bind(file.id)
            .bind(order.id)
            .bind(file.object_key.as_str())
            .bind(file.filename.as_str())
            .bind(file.filetype)
            .bind(file.filesize)
            .bind(index as i32)
            .execute(&mut *conn)
            .await?;

            for (range_index, file_range) in file.ranges.iter().enumerate() {
                sqlx::query(
                    "\
                    INSERT INTO file_ranges (\
                        id, file_id, copies, range, paper_variant_id, paper_orientation,\
                        is_colour, is_double_sided, index\
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\
                    ",
                )
                .bind(file_range.id)
                .bind(file.id)
                .bind(file_range.copies)
                .bind(file_range.range.as_ref())
                .bind(file_range.paper_variant_id)
                .bind(file_range.paper_orientation)
                .bind(file_range.is_colour)
                .bind(file_range.is_double_sided)
                .bind(range_index as i32)
                .execute(&mut *conn)
                .await?;
            }
        }

        for (index, service) in order.services.iter().enumerate() {
            let service_id: ServiceId = sqlx::query_scalar(
                "\
                INSERT INTO services (order_id, type, binding_colour_id, notes, index)\
                VALUES ($1, $2, $3, $4, $5) RETURNING id\
                ",
            )
            .bind(order.id)
            .bind(service.r#type)
            .bind(service.binding_colour_id.as_ref())
            .bind(service.notes.as_ref())
            .bind(index as i32)
            .fetch_one(&mut *conn)
            .await?;

            for file_id in &service.file_ids {
                sqlx::query(
                    "\
                    INSERT INTO services_files (order_id, service_id, file_id)\
                    VALUES ($1, $2, $3)\
                    ",
                )
                .bind(order.id)
                .bind(service_id)
                .bind(file_id)
                .execute(&mut *conn)
                .await?;
            }
        }

        Ok(())
    }

    #[must_use]
    pub fn query_detailed(id: OrderId) -> DetailedOrderQuery {
        DetailedOrderQuery {
            id,
            with_owner: false,
        }
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn fetch_status_for_update(
        conn: &mut PgConnection,
        order_id: OrderId,
    ) -> SqlxResult<OrderStatus> {
        sqlx::query_scalar("SELECT status FROM orders WHERE id = $1 FOR UPDATE")
            .bind(order_id)
            .fetch_one(conn)
            .await
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
            owner_id: None,
            statuses: &[],
            limit: None,
            pagination: None,
        }
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn update_status(
        conn: &mut PgConnection,
        order_id: OrderId,
        status: OrderStatus,
    ) -> SqlxResult<OrderStatusUpdate> {
        sqlx::query("UPDATE orders SET status = $1 WHERE id = $2")
            .bind(status)
            .bind(order_id)
            .execute(&mut *conn)
            .await?;

        sqlx::query_as(
            "\
            INSERT INTO order_status_updates (order_id, status)\
            VALUES ($1, $2) RETURNING created_at, status\
            ",
        )
        .bind(order_id)
        .bind(status)
        .fetch_one(conn)
        .await
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
    owner_id: Option<UserId>,
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

    pub fn bind_owner_id(&mut self, owner_id: UserId) -> &mut Self {
        self.owner_id = Some(owner_id);

        self
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

        if let Some(owner_id) = self.owner_id {
            Self::push_sep(first_bind, qb)
                .push("o.owner_id = ")
                .push_bind(owner_id);
        }

        if !self.statuses.is_empty() {
            let statuses = self.statuses;
            Self::push_sep(first_bind, qb)
                .push("o.status = ANY(")
                .push_bind(statuses)
                .push(')');
        }

        if let (Some(PaginationRequest { page, reverse, .. }), true) = (self.pagination, is_main_qb)
        {
            Self::push_sep(first_bind, qb)
                .push("(o.created_at, o.id)")
                .push(if *reverse { " > (" } else { " < (" })
                .push_bind(page.map(|page| page.timestamp()).unwrap_or(Utc::now()))
                .push(',')
                .push_bind(page.map(|page| page.id()).unwrap_or(Uuid::max()))
                .push(')');
        }

        if is_main_qb {
            qb.push(" GROUP BY o.id, o.created_at, o.order_number, o.status");
        }

        match (self.pagination, is_main_qb) {
            (Some(PaginationRequest { size, reverse, .. }), true) => {
                let sort = if *reverse { "ASC" } else { "DESC" };
                qb.push(" ORDER BY o.created_at ")
                    .push(sort)
                    .push(", o.id ")
                    .push(sort)
                    .push(" LIMIT ")
                    .push_bind(size.get());
            }
            (None, true) => {
                qb.push(" ORDER BY o.created_at DESC");
            }
            _ => {}
        }

        if let (Some(limit), true) = (self.limit, is_main_qb) {
            qb.push(" LIMIT ").push_bind(limit);
        }
    }

    #[tracing::instrument(skip_all, err)]
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

    #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
    #[tracing::instrument(skip_all, err)]
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

        let reverse = self.pagination.unwrap().reverse; // Infallible
        let mut first_bind = true;
        let mut count_qb = self.count_qb.take().unwrap(); // Infallible
        self.build(&mut first_bind, Some(&mut count_qb));
        let mut rows = self.fetch_all(&mut *conn).await?;
        let fetched_size = rows.len();
        let total_count: i64 = count_qb.build_query_scalar().fetch_one(&mut *conn).await?;
        let next = if fetched_size < (total_count as usize) {
            rows.last()
                .map(|last| PageKey::new(last.created_at, last.id.into()))
        } else {
            None
        };
        if reverse {
            rows.reverse();
        }

        Ok((
            rows,
            PaginationResponse::new(next, fetched_size, total_count, reverse),
        ))
    }
}

pub struct DetailedOrderQuery {
    id: OrderId,
    with_owner: bool,
}

impl DetailedOrderQuery {
    pub fn with_owner(mut self, with_owner: bool) -> Self {
        self.with_owner = with_owner;

        self
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn fetch_one(self, conn: &mut PgConnection) -> SqlxResult<DetailedOrder> {
        let order = sqlx::query!(
            "\
            SELECT \
                id AS \"id: OrderId\", created_at, owner_id AS \"owner_id: UserId\", order_number,\
                status AS \"status: OrderStatus\", price, notes \
            FROM orders WHERE id = $1\
            ",
            self.id as OrderId,
        )
        .fetch_one(&mut *conn)
        .await?;

        let owner = self
            .with_owner
            .then_some(UsersTable::fetch_one(&mut *conn, order.owner_id).await?);

        let status_history = sqlx::query_as(
            "\
            SELECT created_at, status FROM order_status_updates \
            WHERE order_id = $1 ORDER BY created_at\
            ",
        )
        .bind(self.id)
        .fetch_all(&mut *conn)
        .await?;

        let files = sqlx::query_as(
            "\
            SELECT f.id, f.object_key, f.filename, f.filetype, f.filesize, r.ranges \
            FROM files AS f \
                JOIN LATERAL (SELECT \
                    ARRAY_AGG(ROW(\
                        id, range, copies, paper_variant_id, paper_orientation, is_colour,\
                        is_double_sided \
                    )::file_range ORDER BY index) AS ranges \
                FROM file_ranges \
                WHERE file_id = f.id) AS r ON true \
            WHERE f.order_id = $1 \
                ORDER BY f.index\
            ",
        )
        .bind(self.id)
        .fetch_all(&mut *conn)
        .await?;

        let services = sqlx::query_as(
            "\
            SELECT \
                s.type, s.binding_colour_id, s.notes, ARRAY_AGG(f.id ORDER BY f.index) AS file_ids \
            FROM services AS s \
                JOIN orders AS o ON o.id = s.order_id \
                JOIN services_files AS sf ON sf.order_id = o.id AND sf.service_id = s.id \
                JOIN files AS f ON f.id = sf.file_id \
            WHERE s.order_id = $1 \
                GROUP BY s.index, s.type, s.binding_colour_id, s.notes \
                ORDER BY s.index\
            ",
        )
        .bind(self.id)
        .fetch_all(conn)
        .await?;

        Ok(DetailedOrder {
            id: order.id,
            created_at: order.created_at,
            owner_id: None,
            owner,
            order_number: order.order_number,
            status: order.status,
            price: order.price,
            notes: order.notes,
            status_history,
            files,
            services,
        })
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

    #[tracing::instrument(skip_all, err)]
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
