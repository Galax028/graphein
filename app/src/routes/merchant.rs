use axum::{Router, middleware, routing::get};

use graphein_common::{AppState, HandlerResponse, middleware::requires_onboarding};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/orders/glance", get(get_merchant_orders_glance))
        .route("/orders/history", get(get_merchant_orders_history))
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_merchant_orders_glance() -> HandlerResponse<()> {
    todo!()
}

async fn get_merchant_orders_history() -> HandlerResponse<()> {
    todo!()
}
