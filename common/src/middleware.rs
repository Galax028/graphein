use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

use crate::{
    AppError, AppState, auth::Session, database::SettingsTable, error::ForbiddenError,
    schemas::enums::UserRole,
};

pub async fn is_accepting_only(
    State(AppState { config, pool, .. }): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if SettingsTable::check_is_accepting(&mut *(pool.acquire().await?), &config.shop_utc_offset())
        .await?
    {
        Ok(next.run(request).await)
    } else {
        Err(AppError::Forbidden(ForbiddenError::Inaccessible))
    }
}

pub async fn requires_onboarding(
    Session { is_onboarded, .. }: Session,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if is_onboarded {
        Ok(next.run(request).await)
    } else {
        Err(AppError::Forbidden(ForbiddenError::OnboardingRequired))
    }
}

pub async fn client_only(
    Session { user_role, .. }: Session,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if matches!(user_role, UserRole::Student | UserRole::Teacher) {
        Ok(next.run(request).await)
    } else {
        Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions))
    }
}

pub async fn merchant_only(
    Session { user_role, .. }: Session,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if matches!(user_role, UserRole::Merchant) {
        Ok(next.run(request).await)
    } else {
        Err(AppError::Forbidden(ForbiddenError::InsufficientPermissions))
    }
}
