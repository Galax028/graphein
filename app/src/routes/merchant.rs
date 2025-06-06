use axum::{Router, extract::State, middleware, routing::get};

use graphein_common::{
    AppState, HandlerResponse,
    database::OrdersTable,
    dto::RequestData,
    extract::QsQuery,
    middleware::{merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{CompactOrder, MerchantOrdersGlance, enums::OrderStatus},
};
use serde::Deserialize;

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/orders/glance", get(get_merchant_orders_glance))
        .route("/orders/history", get(get_merchant_orders_history))
        .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only))
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_merchant_orders_glance(
    State(AppState { pool, .. }): State<AppState>,
) -> HandlerResponse<MerchantOrdersGlance> {
    let mut conn = pool.acquire().await?;
    let incoming = OrdersTable::query_compact()
        .bind_statuses(&[OrderStatus::Reviewing])
        .fetch_all(&mut conn)
        .await?;

    let accepted = OrdersTable::query_compact()
        .bind_statuses(&[OrderStatus::Processing, OrderStatus::Ready])
        .fetch_all(&mut conn)
        .await?;

    let finished = OrdersTable::query_compact()
        .bind_statuses(&[
            OrderStatus::Completed,
            OrderStatus::Rejected,
            OrderStatus::Cancelled,
        ])
        .with_limit(10)
        .fetch_all(&mut conn)
        .await?;

    Ok(ResponseBuilder::new()
        .data(MerchantOrdersGlance {
            incoming,
            accepted,
            finished,
        })
        .build())
}

#[derive(Default, Debug, Deserialize)]
#[serde(default)]
struct OrderStatuses {
    statuses: Option<Vec<OrderStatus>>,
}

async fn get_merchant_orders_history(
    State(AppState { pool, .. }): State<AppState>,
    QsQuery(RequestData {
        data: OrderStatuses { statuses },
        pagination,
    }): QsQuery<RequestData<OrderStatuses>>,
) -> HandlerResponse<Vec<CompactOrder>> {
    let mut conn = pool.acquire().await?;
    let (orders, pagination) = OrdersTable::query_compact()
        .bind_statuses(statuses.as_ref().map_or(
            &[
                OrderStatus::Completed,
                OrderStatus::Rejected,
                OrderStatus::Cancelled,
            ],
            |s| s.as_slice(),
        ))
        .with_pagination(&pagination)
        .fetch_paginated(&mut conn)
        .await?;

    Ok(ResponseBuilder::new()
        .data(orders)
        .pagination(pagination)
        .build())
}
