use axum::{
    Router,
    extract::State,
    middleware,
    routing::{delete, get, post},
};

use graphein_common::{
    AppState, HandlerResponse,
    auth::Session,
    database::OrdersTable,
    dto::RequestData,
    extract::{Path, QsQuery},
    middleware::{client_only, merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{ClientOrdersGlance, CompactOrder, DetailedOrder, OrderId, enums::OrderStatus},
};

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

async fn post_orders_id_status() -> HandlerResponse<()> {
    todo!()
}

async fn post_orders_id_build() -> HandlerResponse<()> {
    todo!()
}

async fn delete_orders_id() -> HandlerResponse<()> {
    todo!()
}

async fn post_orders_id_files() -> HandlerResponse<()> {
    todo!()
}

async fn get_orders_id_files_id_thumbnail() -> HandlerResponse<()> {
    todo!()
}

async fn delete_orders_id_files_id() -> HandlerResponse<()> {
    todo!()
}
