use axum::{
    Router,
    extract::State,
    middleware,
    routing::{get, post, put},
};

use graphein_common::{
    AppError, AppState, HandlerResponse,
    database::{PapersTable, SettingsTable},
    dto::RequestData,
    error::NotFoundError,
    extract::Json,
    middleware::{merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{IsAcceptingResponse, Paper, PaperCreate, Settings, SettingsUpdate},
};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/accepting", get(get_opts_accepting))
        .route(
            "/settings",
            put(put_opts_settings)
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

async fn get_opts_accepting(
    State(AppState { pool, .. }): State<AppState>,
) -> HandlerResponse<IsAcceptingResponse> {
    let mut conn = pool.acquire().await?;
    let is_accepting = SettingsTable::check_is_accepting(&mut conn).await?;

    Ok(ResponseBuilder::new().data(is_accepting).build())
}

async fn put_opts_settings(
    State(AppState { pool, .. }): State<AppState>,
    Json(RequestData { data, .. }): Json<RequestData<SettingsUpdate>>,
) -> HandlerResponse<Settings> {
    if data.open_time >= data.close_time {
        return Err(AppError::BadRequest(
            "[4008] Malformed settings data was provided.".into(),
        ));
    }

    let mut tx = pool.begin().await?;
    let settings = SettingsTable::update(&mut tx, &data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new().data(settings).build())
}

async fn get_opts_papers(
    State(AppState { pool, .. }): State<AppState>,
) -> HandlerResponse<Vec<Paper>> {
    let mut conn = pool.acquire().await?;
    let papers = PapersTable::fetch_all(&mut conn).await?;

    Ok(ResponseBuilder::new().data(papers).build())
}

async fn post_opts_papers(
    State(AppState { pool, .. }): State<AppState>,
    Json(RequestData { data, .. }): Json<RequestData<PaperCreate>>,
) -> HandlerResponse<Paper> {
    let mut tx = pool.begin().await?;
    let (paper_id, paper_variants) = PapersTable::create_new(&mut tx, &data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(Paper {
            id: paper_id,
            name: data.name,
            length: data.length,
            width: data.width,
            is_default: data.is_default,
            variants: paper_variants,
        })
        .build())
}

async fn put_opts_papers() -> HandlerResponse<()> {
    todo!()
}

async fn delete_opts_papers() -> HandlerResponse<()> {
    todo!()
}

// TODO: Unimplemented
async fn get_opts_services_binding() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}

// TODO: Unimplemented
async fn post_opts_services_binding() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}

// TODO: Unimplemented
async fn put_opts_services_binding() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}

// TODO: Unimplemented
async fn delete_opts_services_binding() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}

// TODO: Unimplemented
async fn get_opts_services_laminate() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}

// TODO: Unimplemented
async fn post_opts_services_laminate() -> HandlerResponse<()> {
    Err(AppError::NotFound(NotFoundError::PathNotFound))
}
