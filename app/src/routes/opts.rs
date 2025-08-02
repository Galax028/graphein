use axum::{
    Router,
    extract::{Path, State},
    middleware,
    routing::{get, post, put},
};

use graphein_common::{
    AppError, AppState, HandlerResponse,
    database::{PapersTable, SettingsTable},
    error::{BadRequestError, ForbiddenError, NotFoundError},
    extract::Json,
    middleware::{merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{
        IsAcceptingResponse, Paper, PaperCreate, PaperId, PaperUpdate, PaperVariant,
        PaperVariantCreate, PaperVariantId, PaperWithoutVariants, Settings, SettingsUpdate,
    },
};
use http::StatusCode;

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
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/papers/{id}",
            put(put_opts_papers_id)
                .delete(delete_opts_papers_id)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/papers/{id}/variants",
            post(post_opts_papers_id_variants)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/papers/{id}/variants/{id}",
            put(put_opts_papers_id_variants_id)
                .delete(delete_opts_papers_id_variants_id)
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
    Json(request_data): Json<SettingsUpdate>,
) -> HandlerResponse<Settings> {
    if request_data.open_time >= request_data.close_time {
        return Err(AppError::BadRequest(BadRequestError::MalformedJson(
            "Request data contains malformed values for `openTime` and `closeTime`".into(),
        )));
    }

    let mut tx = pool.begin().await?;
    let settings = SettingsTable::update(&mut tx, &request_data).await?;
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
    Json(request_data): Json<PaperCreate>,
) -> HandlerResponse<Paper> {
    if request_data.name.is_empty()
        || request_data.length <= 0
        || request_data.width <= 0
        || request_data.length < request_data.width
        || request_data.variants.is_empty()
        || request_data
            .variants
            .iter()
            .fold((0, 0), |(empty_count, default_count), variant| {
                (
                    empty_count + usize::from(variant.name.is_empty()),
                    default_count + usize::from(variant.is_default),
                )
            })
            != (0, 1)
    {
        return Err(AppError::BadRequest(BadRequestError::MalformedJson(
            "Request data contains malformed data for name and/or variants".into(),
        )));
    }

    let mut tx = pool.begin().await?;
    if request_data.is_default {
        PapersTable::unset_default_paper(&mut tx).await?;
    }
    let (paper_id, paper_variants) = PapersTable::create_new(&mut tx, &request_data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(Paper {
            id: paper_id,
            name: request_data.name,
            length: request_data.length,
            width: request_data.width,
            is_default: request_data.is_default,
            variants: paper_variants,
        })
        .build())
}

async fn put_opts_papers_id(
    State(AppState { pool, .. }): State<AppState>,
    Path(paper_id): Path<PaperId>,
    Json(request_data): Json<PaperUpdate>,
) -> HandlerResponse<PaperWithoutVariants> {
    if request_data.name.is_empty()
        || request_data.length <= 0
        || request_data.width <= 0
        || request_data.length < request_data.width
    {
        return Err(AppError::BadRequest(BadRequestError::MalformedJson(
            "Request data contains malformed data for name and/or variants".into(),
        )));
    }

    let mut tx = pool.begin().await?;
    if request_data.is_default {
        PapersTable::unset_default_paper(&mut tx).await?;
    }
    PapersTable::update(&mut tx, paper_id, &request_data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(PaperWithoutVariants {
            id: paper_id,
            name: request_data.name,
            length: request_data.length,
            width: request_data.width,
            is_default: request_data.is_default,
        })
        .build())
}

async fn delete_opts_papers_id(
    State(AppState { pool, .. }): State<AppState>,
    Path(paper_id): Path<PaperId>,
) -> Result<StatusCode, AppError> {
    if PapersTable::is_default(&mut *(pool.acquire().await?), paper_id).await? {
        return Err(AppError::Forbidden(
            ForbiddenError::DeleteConstraintViolation,
        ));
    }

    let mut tx = pool.begin().await?;
    PapersTable::delete(&mut tx, paper_id).await?;
    tx.commit().await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn post_opts_papers_id_variants(
    State(AppState { pool, .. }): State<AppState>,
    Path(paper_id): Path<PaperId>,
    Json(request_data): Json<PaperVariantCreate>,
) -> HandlerResponse<PaperVariant> {
    if request_data.name.is_empty() {
        return Err(AppError::BadRequest(BadRequestError::MalformedJson(
            "Request data contains malformed data for name".into(),
        )));
    }

    let mut tx = pool.begin().await?;
    if request_data.is_default {
        PapersTable::unset_default_variant(&mut tx, paper_id).await?;
    }
    let paper_variant_id =
        PapersTable::create_new_variant(&mut tx, paper_id, &request_data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(PaperVariant {
            id: paper_variant_id,
            name: request_data.name,
            is_default: request_data.is_default,
            is_available: request_data.is_available,
            is_laminatable: request_data.is_laminatable,
        })
        .build())
}

async fn put_opts_papers_id_variants_id(
    State(AppState { pool, .. }): State<AppState>,
    Path((paper_id, paper_variant_id)): Path<(PaperId, PaperVariantId)>,
    Json(request_data): Json<PaperVariantCreate>,
) -> HandlerResponse<PaperVariant> {
    if request_data.name.is_empty() {
        return Err(AppError::BadRequest(BadRequestError::MalformedJson(
            "Request data contains malformed data for name".into(),
        )));
    }

    let mut tx = pool.begin().await?;
    if request_data.is_default {
        PapersTable::unset_default_variant(&mut tx, paper_id).await?;
    }
    PapersTable::update_variant(&mut tx, paper_id, paper_variant_id, &request_data).await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(PaperVariant {
            id: paper_variant_id,
            name: request_data.name,
            is_default: request_data.is_default,
            is_available: request_data.is_available,
            is_laminatable: request_data.is_laminatable,
        })
        .build())
}

async fn delete_opts_papers_id_variants_id(
    State(AppState { pool, .. }): State<AppState>,
    Path((paper_id, paper_variant_id)): Path<(PaperId, PaperVariantId)>,
) -> Result<StatusCode, AppError> {
    let mut conn = pool.acquire().await?;
    if PapersTable::variants_len(&mut conn, paper_id).await? == 1
        || PapersTable::is_default_variant(&mut conn, paper_id, paper_variant_id).await?
    {
        return Err(AppError::Forbidden(
            ForbiddenError::DeleteConstraintViolation,
        ));
    }

    let mut tx = pool.begin().await?;
    PapersTable::delete_variant(&mut tx, paper_id, paper_variant_id).await?;
    tx.commit().await?;

    Ok(StatusCode::NO_CONTENT)
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
