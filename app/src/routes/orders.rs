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
    extract::Path,
    middleware::requires_onboarding,
    response::ResponseBuilder,
    schemas::{DetailedOrder, OrderId},
};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/glance", get(get_orders_glance))
        .route("/history", get(get_orders_history))
        .route("/", post(post_orders))
        .route("/{id}", get(get_orders_id).delete(delete_orders_id))
        .route("/{id}/status", post(post_orders_id_status))
        .route("/{id}/build", post(post_orders_id_build))
        .route("/{id}/files", post(post_orders_id_files))
        .route(
            "/{id}/files/{id}/thumbnail",
            get(get_orders_id_files_id_thumbnail),
        )
        .route("/{id}/files/{id}", delete(delete_orders_id_files_id))
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_orders_glance() -> HandlerResponse<()> {
    todo!()
}

async fn get_orders_history() -> HandlerResponse<()> {
    todo!()
}

async fn post_orders() -> HandlerResponse<()> {
    todo!()
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
