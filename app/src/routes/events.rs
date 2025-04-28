use axum::{Router, middleware, routing::get};

use graphein_common::{AppState, HandlerResponse, middleware::requires_onboarding};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/order-status-changes",
            get(get_events_order_status_changes),
        )
        .route(
            "/merchant/incoming-orders",
            get(get_events_merchant_incoming_orders),
        )
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_events_order_status_changes() -> HandlerResponse<()> {
    todo!()
}

async fn get_events_merchant_incoming_orders() -> HandlerResponse<()> {
    todo!()
}
