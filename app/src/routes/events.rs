use axum::{Router, routing::get};

use graphein_common::{AppState, HandlerResponse};

pub(super) fn expand_router() -> Router<AppState> {
    Router::new()
        .route(
            "/order-status-changes",
            get(get_events_order_status_changes),
        )
        .route(
            "/merchant/incoming-orders",
            get(get_events_merchant_incoming_orders),
        )
}

async fn get_events_order_status_changes() -> HandlerResponse<()> {
    todo!()
}

async fn get_events_merchant_incoming_orders() -> HandlerResponse<()> {
    todo!()
}
