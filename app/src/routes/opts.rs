use axum::{
    Router, middleware,
    routing::{get, post},
};

use graphein_common::{
    AppState, HandlerResponse,
    middleware::{merchant_only, requires_onboarding},
};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/accepting", get(get_opts_accepting))
        .route(
            "/accepting",
            post(post_opts_accepting)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route("/papers", get(get_opts_papers))
        .route(
            "/papers",
            post(post_opts_papers)
                .put(put_opts_papers)
                .delete(delete_opts_papers)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route("/services/binding", get(get_opts_services_binding))
        .route(
            "/services/binding",
            post(post_opts_services_binding)
                .put(put_opts_services_binding)
                .delete(delete_opts_services_binding)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route("/services/laminate", get(get_opts_services_laminate))
        .route(
            "/services/laminate",
            post(post_opts_services_laminate)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
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

async fn get_opts_services_binding() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_services_binding() -> HandlerResponse<()> {
    todo!()
}

async fn put_opts_services_binding() -> HandlerResponse<()> {
    todo!()
}

async fn delete_opts_services_binding() -> HandlerResponse<()> {
    todo!()
}

async fn get_opts_services_laminate() -> HandlerResponse<()> {
    todo!()
}

async fn post_opts_services_laminate() -> HandlerResponse<()> {
    todo!()
}
