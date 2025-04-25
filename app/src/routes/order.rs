use axum::extract::State;
use uuid::Uuid;

use graphein_common::{
    AppError, AppState, HandlerResponse,
    auth::Session,
    dto::{FetchLevel, RequestData},
    extract::{Path, QsQuery, RequiresOnboarding},
    response::ResponseBuilder,
    schemas::Order,
};

pub(super) async fn get_bulk_orders(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    _: RequiresOnboarding,
    QsQuery(RequestData {
        fetch_level,
        data: order_ids,
        pagination,
    }): QsQuery<RequestData<Vec<Uuid>>>,
) -> HandlerResponse<Vec<Order>> {
    if order_ids.len() == 0 {
        return Err(AppError::BadRequest {
            message: "At least one order ID must be present.".to_string(),
        });
    }

    let mut conn = pool.acquire().await?;
    session
        .assert_read_bulk_orders(&mut conn, &order_ids)
        .await?;

    todo!()
}

pub(super) async fn get_order(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    _: RequiresOnboarding,
    Path(order_id): Path<Uuid>,
    QsQuery(RequestData { fetch_level, .. }): QsQuery<RequestData>,
) -> HandlerResponse<Order> {
    let mut conn = pool.acquire().await?;
    session.assert_read_order(&mut conn, order_id).await?;

    let order = Order::fetch_one(&mut conn, order_id)
        .await?
        .into_model_variant(&mut conn, fetch_level, FetchLevel::IdOnly)
        .await?;

    Ok(ResponseBuilder::new().data(order).build())
}

pub(super) async fn post_order() -> HandlerResponse<()> {
    todo!()
}

pub(super) async fn put_order() -> HandlerResponse<()> {
    todo!()
}

pub(super) async fn delete_order() -> HandlerResponse<()> {
    todo!()
}
