use axum::{
    extract::Request,
    middleware::Next,
    response::{IntoResponse as _, Response},
};

use crate::{AppError, auth::Session, error::ForbiddenError, schemas::enums::UserRole};

pub async fn requires_onboarding(
    Session { is_onboarded, .. }: Session,
    request: Request,
    next: Next,
) -> Response {
    if is_onboarded {
        next.run(request).await
    } else {
        AppError::Forbidden(ForbiddenError::OnboardingRequired).into_response()
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
