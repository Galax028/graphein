use std::str::FromStr;

use axum::{
    Router,
    extract::State,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, get, post},
};
use futures::stream::{StreamExt as _, TryStreamExt as _};

use graphein_common::{
    AppError, AppState, HandlerResponse, MAX_FILE_LIMIT,
    auth::Session,
    database::{FilesTable, OrdersTable},
    dto::RequestData,
    error::NotFoundError,
    extract::{Json, Path, QsQuery},
    middleware::{client_only, merchant_only, requires_onboarding},
    response::ResponseBuilder,
    schemas::{
        ClientOrdersGlance, CompactOrder, DetailedOrder, FileId, FilePresignResponse,
        FileUploadCreate, FileUploadResponse, OrderCreate, OrderId, OrderStatusUpdate,
        enums::{FileType, OrderStatus, UserRole},
    },
};
use http::StatusCode;
use sqlx::Acquire;
use tokio::sync::mpsc;
use tracing::{Instrument as _, Span};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/glance",
            get(get_orders_glance)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/history",
            get(get_orders_history)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/",
            post(post_orders)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route("/{id}", get(get_orders_id))
        .route(
            "/{id}",
            delete(delete_orders_id)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/status",
            post(post_orders_id_status)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/{id}/build",
            post(post_orders_id_build)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/files",
            get(get_orders_id_files)
                .route_layer(middleware::from_fn_with_state(state.clone(), merchant_only)),
        )
        .route(
            "/{id}/files",
            post(post_orders_id_files)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route(
            "/{id}/files/{id}/thumbnail",
            get(get_orders_id_files_id_thumbnail),
        )
        .route(
            "/{id}/files/{id}",
            delete(delete_orders_id_files_id)
                .route_layer(middleware::from_fn_with_state(state.clone(), client_only)),
        )
        .route_layer(middleware::from_fn_with_state(state, requires_onboarding))
}

async fn get_orders_glance(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<ClientOrdersGlance> {
    let mut conn = pool.acquire().await?;
    let ongoing = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Reviewing,
            OrderStatus::Processing,
            OrderStatus::Ready,
        ])
        .fetch_all(&mut conn)
        .instrument(Span::current())
        .await?;

    let finished = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Completed,
            OrderStatus::Rejected,
            OrderStatus::Cancelled,
        ])
        .with_limit(5)
        .fetch_all(&mut conn)
        .instrument(Span::current())
        .await?;

    Ok(ResponseBuilder::new()
        .data(ClientOrdersGlance { ongoing, finished })
        .build())
}

async fn get_orders_history(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
    QsQuery(RequestData { pagination, .. }): QsQuery<RequestData>,
) -> HandlerResponse<Vec<CompactOrder>> {
    let mut conn = pool.acquire().await?;
    let (orders, pagination) = OrdersTable::query_compact()
        .bind_owner_id(user_id)
        .bind_statuses(&[
            OrderStatus::Completed,
            OrderStatus::Rejected,
            OrderStatus::Cancelled,
        ])
        .with_pagination(&pagination)
        .fetch_paginated(&mut conn)
        .instrument(Span::current())
        .await?;

    Ok(ResponseBuilder::new()
        .data(orders)
        .pagination(pagination)
        .build())
}

async fn post_orders(
    State(AppState { draft_orders, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<OrderId> {
    let order_id = draft_orders.insert(user_id);

    Ok(ResponseBuilder::new().data(order_id).build())
}

async fn get_orders_id(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    Path(id): Path<OrderId>,
) -> HandlerResponse<DetailedOrder> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .instrument(Span::current())
        .await?;

    let order = OrdersTable::query_detailed(id)
        .with_owner(matches!(session.user_role, UserRole::Merchant))
        .fetch_one(&mut conn)
        .instrument(Span::current())
        .await?;

    Ok(ResponseBuilder::new().data(order).build())
}

async fn post_orders_id_status(
    State(AppState { pool, .. }): State<AppState>,
    session: Session,
    Path(order_id): Path<OrderId>,
) -> HandlerResponse<OrderStatusUpdate> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(order_id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .instrument(Span::current())
        .await?;

    let mut tx = conn.begin().await?;
    let previous_status = OrdersTable::fetch_status_for_update(&mut tx, order_id)
        .instrument(Span::current())
        .await?;
    let next_status = match previous_status {
        OrderStatus::Reviewing => OrderStatus::Processing,
        OrderStatus::Processing => OrderStatus::Ready,
        OrderStatus::Ready => OrderStatus::Completed,
        _ => {
            return Err(AppError::BadRequest(
                "[4005] Cannot process status updates for this order any further.".into(),
            ));
        }
    };
    let order_status_update = OrdersTable::update_status(&mut tx, order_id, next_status)
        .instrument(Span::current())
        .await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new().data(order_status_update).build())
}

async fn post_orders_id_build(
    State(AppState {
        pool,
        bucket,
        draft_orders,
        ..
    }): State<AppState>,
    Session { user_id, .. }: Session,
    Path(order_id): Path<OrderId>,
    Json(mut request_data): Json<OrderCreate>,
) -> HandlerResponse<DetailedOrder> {
    draft_orders.exists(user_id, order_id)?;
    if request_data.files.is_empty() {
        return Err(AppError::BadRequest(
            "[4008] There are no files present in this order.".into(),
        ));
    }

    request_data.files.iter_mut().for_each(|file| {
        file.filename = file.filename.trim().to_string();
        if let Some(ext_len) = file
            .filename
            .rsplit_once('.')
            .and_then(|(_, ext)| FileType::from_str(ext).and(Ok(ext.len() + 1)).ok())
        {
            file.filename.truncate(file.filename.len() - ext_len);
        }
    });

    let order = draft_orders.build(&bucket, user_id, request_data).await?;
    let mut tx = pool.begin().await?;
    OrdersTable::create_new(&mut tx, &order)
        .instrument(Span::current())
        .await?;
    tx.commit().await?;

    Ok(ResponseBuilder::new()
        .data(order)
        .status_code(StatusCode::CREATED)
        .build())
}

async fn delete_orders_id(
    State(AppState {
        pool, draft_orders, ..
    }): State<AppState>,
    session: Session,
    Path(order_id): Path<OrderId>,
) -> Result<StatusCode, AppError> {
    if draft_orders.delete(session.user_id) {
        return Ok(StatusCode::NO_CONTENT);
    }

    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(order_id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .instrument(Span::current())
        .await?;

    let cancelled_or_rejected = match session.user_role {
        UserRole::Student | UserRole::Teacher => OrderStatus::Cancelled,
        UserRole::Merchant => OrderStatus::Rejected,
    };
    OrdersTable::update_status(&mut conn, order_id, cancelled_or_rejected)
        .instrument(Span::current())
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn get_orders_id_files(
    State(AppState { pool, bucket, .. }): State<AppState>,
    session: Session,
    Path(order_id): Path<OrderId>,
) -> HandlerResponse<Vec<FilePresignResponse>> {
    let mut conn = pool.acquire().await?;
    OrdersTable::permissions_checker(order_id, session)
        .allow_merchant(true)
        .test(&mut conn)
        .instrument(Span::current())
        .await?;

    let (tx, mut rx) = mpsc::channel(MAX_FILE_LIMIT);
    FilesTable::stream_all_for_metadata_from_order(&mut conn, order_id)
        .map(move |meta| meta.map(|meta| (meta, tx.clone())))
        .err_into::<AppError>()
        .try_for_each_concurrent(MAX_FILE_LIMIT, async |(meta, tx)| {
            let url = bucket
                .presign_get_file(&meta.object_key, &meta.filename, meta.filetype)
                .await?;

            tx.send(FilePresignResponse { id: meta.id, url }).await?;
            Ok(())
        })
        .instrument(Span::current())
        .await?;

    let mut responses = Vec::new();
    rx.recv_many(&mut responses, MAX_FILE_LIMIT).await;
    rx.close();

    Ok(ResponseBuilder::new().data(responses).build())
}

async fn post_orders_id_files(
    State(AppState {
        bucket,
        draft_orders,
        ..
    }): State<AppState>,
    Session { user_id, .. }: Session,
    Path(order_id): Path<OrderId>,
    Json(FileUploadCreate { filetype, filesize }): Json<FileUploadCreate>,
) -> HandlerResponse<FileUploadResponse> {
    draft_orders.exists(user_id, order_id)?;

    let (file_id, object_key) = draft_orders.add_file(user_id, filetype, filesize)?;
    let upload_url = bucket
        .presign_put(
            &draft_orders.get_created_at(user_id)?,
            filetype,
            filesize,
            &object_key,
        )
        .await?;

    Ok(ResponseBuilder::new()
        .data(FileUploadResponse {
            id: file_id,
            object_key,
            upload_url,
        })
        .status_code(StatusCode::ACCEPTED)
        .build())
}

async fn get_orders_id_files_id_thumbnail(
    State(AppState {
        pool,
        bucket,
        draft_orders,
        thumbnailer,
        ..
    }): State<AppState>,
    session: Session,
    Path((order_id, file_id)): Path<(OrderId, FileId)>,
) -> Result<Response, AppError> {
    let (object_key, filetype) = if draft_orders.exists(session.user_id, order_id).is_ok() {
        let draft_order = draft_orders.get_order(session.user_id)?;
        let draft_file = draft_order
            .files
            .iter()
            .find(|file| file.id == file_id)
            .ok_or(NotFoundError::ResourceNotFound)?;

        (draft_file.object_key.clone(), draft_file.filetype)
    } else {
        let mut conn = pool.acquire().await?;
        OrdersTable::permissions_checker(order_id, session)
            .allow_merchant(true)
            .test(&mut conn)
            .instrument(Span::current())
            .await?;

        let file = FilesTable::fetch_one_for_metadata_from_order(&mut conn, order_id, file_id)
            .instrument(Span::current())
            .await?;

        (file.object_key, file.filetype)
    };

    let Some(thumbnail_url) = bucket
        .presign_get_file_thumbnail(&object_key, filetype)
        .await?
    else {
        thumbnailer
            .signal_for_processing(object_key, filetype)
            .await?;

        return Ok(StatusCode::ACCEPTED.into_response());
    };

    Ok(ResponseBuilder::new()
        .data(thumbnail_url)
        .build()
        .into_response())
}

async fn delete_orders_id_files_id(
    State(AppState {
        bucket,
        draft_orders,
        ..
    }): State<AppState>,
    Session { user_id, .. }: Session,
    Path((order_id, file_id)): Path<(OrderId, FileId)>,
) -> Result<StatusCode, AppError> {
    draft_orders.exists(user_id, order_id)?;
    let draft_order = draft_orders.get_order(user_id)?;
    let draft_file = draft_order
        .files
        .iter()
        .find(|file| file.id == file_id)
        .ok_or(NotFoundError::ResourceNotFound)?;

    bucket
        .delete_file(&draft_file.object_key, draft_file.filetype)
        .await?;
    draft_orders.remove_file(user_id, file_id)?;

    Ok(StatusCode::NO_CONTENT)
}
