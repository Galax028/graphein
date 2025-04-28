use axum::{
    routing::{delete, get, post}, Router
};

use graphein_common::{AppState, HandlerResponse};

pub(super) fn expand_router() -> Router<AppState> {
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

async fn get_orders_id() -> HandlerResponse<()> {
    todo!()
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
