use axum::{
    Router,
    extract::State,
    middleware,
    routing::{delete, get, post},
};

use graphein_common::{
    AppError, AppState, HandlerResponse,
    auth::Session,
    database::OrdersTable,
    dto::RequestData,
    extract::{Json, Path, QsQuery},
    middleware::{client_only, merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{
        ClientOrdersGlance, CompactOrder, DetailedOrder, FileId, FileUploadCreate,
        FileUploadResponse, OrderId, OrderStatusUpdate,
        enums::{OrderStatus, UserRole},
    },
};
use http::StatusCode;
use sqlx::Acquire;

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/glance",
            get(get_orders_glance)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/history",
            get(get_orders_history)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/",
            post(post_orders)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route("/{id}", get(get_orders_id))
        .route(
            "/{id}",
            delete(delete_orders_id)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/status",
            post(post_orders_id_status)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/{id}/build",
            post(post_orders_id_build)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/files",
            post(post_orders_id_files)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/files/{id}/thumbnail",
            get(get_orders_id_files_id_thumbnail),
        )
        .route(
            "/{id}/files/{id}",
            delete(delete_orders_id_files_id)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_orders_glance(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<ClientOrdersGlance> {
    let mut conn = pool.acquire().await?;
    let ongoing = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Reviewing,
            OrderStatus::Processing,
            OrderStatus::Ready,
        ])
        .fetch_all(&mut conn)
        .await?;

    let finished = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Completed,
            OrderStatus::Rejected,
            OrderStatus::Cancelled,
        ])
        .with_limit(5)
        .fetch_all(&mut conn)
        .await?;

    Ok(ResponseBuilder::new()
        .data(ClientOrdersGlance { ongoing, finished })
        .build())
}

async fn get_orders_history(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
    QsQuery(RequestData { pagination, .. }): QsQuery<RequestData>,
) -> HandlerResponse<Vec<CompactOrder>> {
    let mut conn = pool.acquire().await?;
    let (orders, pagination) = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Completed,
            OrderStatus::Rejected,
            OrderStatus::Cancelled,
        ])
        .with_pagination(&pagination)
        .fetch_paginated(&mut conn)
        .await?;

    Ok(ResponseBuilder::new()
        .data(orders)
        .pagination(pagination)
        .build())
}

async fn post_orders(
    State(AppState { draft_orders, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<OrderId> {
    let order_id = draft_orders.insert(user_id)?;

    Ok(ResponseBuilder::new().data(order_id).build())
}

async fn get_orders_id(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    Path(id): Path<OrderId>,
) -> HandlerResponse<DetailedOrder> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .await?;

    let order = OrdersTable::fetch_one(&mut conn, id).await?;

    Ok(ResponseBuilder::new().data(order).build())
}

async fn post_orders_id_status(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    Path(order_id): Path<OrderId>,
) -> HandlerResponse<OrderStatusUpdate> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(order_id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .await?;

    let mut tx = conn.begin().await?;
    let previous_status = OrdersTable::fetch_status_for_update(&mut tx, order_id).await?;
    let next_status = match previous_status {
        OrderStatus::Reviewing => OrderStatus::Processing,
        OrderStatus::Processing => OrderStatus::Ready,
        OrderStatus::Ready => OrderStatus::Completed,
        _ => {
            return Err(AppError::BadRequest(
                "Cannot process status updates for this order any further.".into(),
            ));
        }
    };
    let order_status_update = OrdersTable::update_status(&mut tx, order_id, next_status).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new().data(order_status_update).build())
}

async fn post_orders_id_build() -> HandlerResponse<()> {
    todo!()
}

async fn delete_orders_id(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    Path(order_id): Path<OrderId>,
) -> Result<StatusCode, AppError> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(order_id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .await?;

    let cancelled_or_rejected = match session.user_role {
        UserRole::Student | UserRole::Teacher => OrderStatus::Cancelled,
        UserRole::Merchant => OrderStatus::Rejected,
    };
    OrdersTable::update_status(&mut conn, order_id, cancelled_or_rejected).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn post_orders_id_files(
    State(AppState {
        bucket,
        draft_orders,
        ..
    }): State<AppState>,
    Session { user_id, .. }: Session,
    Path(order_id): Path<OrderId>,
    Json(FileUploadCreate { filetype, filesize }): Json<FileUploadCreate>,
) -> HandlerResponse<FileUploadResponse> {
    draft_orders.exists(user_id, order_id)?;

    let (file_id, object_key) = draft_orders.add_file(user_id, filetype, filesize)?;
    let upload_url = bucket
        .presign_put(
            &draft_orders.get_created_at(user_id)?,
            filetype,
            filesize,
            &object_key,
        )
        .await?;

    Ok(ResponseBuilder::new()
        .data(FileUploadResponse {
            id: file_id,
            object_key,
            upload_url,
        })
        .status_code(StatusCode::ACCEPTED)
        .build())
}

async fn get_orders_id_files_id_thumbnail() -> HandlerResponse<()> {
    todo!()
}

async fn delete_orders_id_files_id(
    State(AppState {
        bucket,
        draft_orders,
        ..
    }): State<AppState>,
    Session { user_id, .. }: Session,
    Path((order_id, file_id)): Path<(OrderId, FileId)>,
) -> Result<StatusCode, AppError> {
    draft_orders.exists(user_id, order_id)?;
    let draft_file = draft_orders.get_file(user_id, file_id)?;
    bucket
        .delete_file(&draft_file.object_key, draft_file.filetype)
        .await?;
    draft_orders.remove_file(user_id, file_id)?;

    Ok(StatusCode::NO_CONTENT)
}
