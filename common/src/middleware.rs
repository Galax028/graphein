use axum::{
    extract::Request,
    middleware::Next,
    response::{IntoResponse as _, Response},
};

use crate::{AppError, auth::Session, error::ForbiddenError};

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
