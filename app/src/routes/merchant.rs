use axum::{Router, routing::get};

use graphein_common::{AppState, HandlerResponse};

pub(super) fn expand_router() -> Router<AppState> {
    Router::new()
        .route("/orders/glance", get(get_merchant_orders_glance))
        .route("/orders/history", get(get_merchant_orders_history))
}

async fn get_merchant_orders_glance() -> HandlerResponse<()> {
    todo!()
}

async fn get_merchant_orders_history() -> HandlerResponse<()> {
    todo!()
}
