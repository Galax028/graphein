use axum::{
    Router,
    extract::State,
    middleware,
    routing::{get, post},
};

use axum_extra::extract::CookieJar;
use graphein_common::{
    AppError, AppState, HandlerResponse,
    auth::Session,
    database::UsersTable,
    dto::RequestData,
    error::{ForbiddenError, MISSING_FIELDS},
    extract::Json,
    middleware::requires_onboarding,
    response::ResponseBuilder,
    schemas::{User, UserUpdateData, enums::UserRole},
};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/",
            get(get_user)
                .put(put_user)
                .layer(middleware::from_fn_with_state(state, requires_onboarding)),
        )
        .route("/onboard", post(post_user_onboard))
}

async fn get_user(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<User> {
    let mut conn = pool.acquire().await?;
    let user = UsersTable::fetch_one(&mut conn, user_id).await?;

    Ok(ResponseBuilder::new().data(user).build())
}

async fn put_user(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
    Json(RequestData { data, .. }): Json<RequestData<UserUpdateData>>,
) -> HandlerResponse<User> {
    let mut conn = pool.acquire().await?;
    let user_role = UsersTable::fetch_role(&mut conn, user_id).await?;

    if matches!(user_role, UserRole::Merchant) {
        return Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions));
    }

    let user = match (user_role, data.tel, data.class, data.class_no) {
        (UserRole::Student, Some(ref tel), Some(class), Some(class_no)) => {
            UsersTable::update(user_id)
                .bind_tel(tel)
                .bind_class(class)
                .bind_class_no(class_no)
                .execute(&mut conn)
                .await?
        }
        (UserRole::Teacher, Some(ref tel), None, None) => {
            UsersTable::update(user_id)
                .bind_tel(tel)
                .execute(&mut conn)
                .await?
        }
        _ => {
            return Err(AppError::BadRequest(MISSING_FIELDS.into()));
        }
    };

    Ok(ResponseBuilder::new().data(user).build())
}

async fn post_user_onboard(
    State(AppState { pool, sessions, .. }): State<AppState>,
    cookies: CookieJar,
    Session {
        user_id,
        is_onboarded,
        ..
    }: Session,
    Json(RequestData { data, .. }): Json<RequestData<UserUpdateData>>,
) -> HandlerResponse<User> {
    let mut conn = pool.acquire().await?;
    let user_role = UsersTable::fetch_role(&mut conn, user_id).await?;

    if is_onboarded || matches!(user_role, UserRole::Merchant) {
        return Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions));
    }

    let user = match (user_role, data.tel, data.class, data.class_no) {
        (UserRole::Student, Some(ref tel), Some(class), Some(class_no)) => {
            UsersTable::update(user_id)
                .bind_tel(tel)
                .bind_class(class)
                .bind_class_no(class_no)
                .set_onboard()
                .execute(&mut conn)
                .await?
        }
        (UserRole::Teacher, Some(ref tel), None, None) => {
            UsersTable::update(user_id)
                .bind_tel(tel)
                .set_onboard()
                .execute(&mut conn)
                .await?
        }
        _ => {
            return Err(AppError::BadRequest(MISSING_FIELDS.into()));
        }
    };

    let session_id = cookies.get("session_token").unwrap().value_trimmed();
    sessions.set_onboard(session_id).await?;

    Ok(ResponseBuilder::new().data(user).build())
}
