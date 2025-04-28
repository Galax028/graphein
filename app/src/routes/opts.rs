use axum::{Router, routing::get};

use graphein_common::{AppState, HandlerResponse};

pub(super) fn expand_router() -> Router<AppState> {
    Router::new()
        .route(
            "/accepting",
            get(get_opts_accepting).post(post_opts_accepting),
        )
        .route(
            "/papers",
            get(get_opts_papers)
                .post(post_opts_papers)
                .put(put_opts_papers)
                .delete(delete_opts_papers),
        )
        .route(
            "/services/bookbinding",
            get(get_opts_services_bookbinding)
                .post(post_opts_services_bookbinding)
                .put(put_opts_services_bookbinding)
                .delete(delete_opts_services_bookbinding),
        )
        .route(
            "/services/laminate",
            get(get_opts_services_laminate).post(post_opts_services_laminate),
        )
}

async fn get_opts_accepting() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_accepting() -> HandlerResponse<()> {
    todo!()
}

async fn get_opts_papers() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_papers() -> HandlerResponse<()> {
    todo!()
}

async fn put_opts_papers() -> HandlerResponse<()> {
    todo!()
}

async fn delete_opts_papers() -> HandlerResponse<()> {
    todo!()
}

async fn get_opts_services_bookbinding() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_services_bookbinding() -> HandlerResponse<()> {
    todo!()
}

async fn put_opts_services_bookbinding() -> HandlerResponse<()> {
    todo!()
}

async fn delete_opts_services_bookbinding() -> HandlerResponse<()> {
    todo!()
}

async fn get_opts_services_laminate() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_services_laminate() -> HandlerResponse<()> {
    todo!()
}
