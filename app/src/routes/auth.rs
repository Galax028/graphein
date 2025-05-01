use std::{sync::Arc, time::Duration};

use axum::{
    Router,
    extract::State,
    http::StatusCode,
    response::{Html, IntoResponse as _, Redirect, Response},
    routing::{get, post},
};
use axum_extra::extract::{
    CookieJar,
    cookie::{Cookie, SameSite},
};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use serde_json::json;

use graphein_common::{
    AppError, AppState, GOOGLE_SIGNING_KEYS,
    auth::{
        GoogleOAuthCodeExchangeParams, GoogleOAuthInitParams, GoogleOAuthReqParams, IdToken,
        Session, decode_and_verify_id_token, hmac_sign, hmac_verify,
    },
    database::UsersTable,
    error::AuthError,
    extract::QsQuery,
    schemas::{UserId, enums::UserRole},
};

#[cfg(debug_assertions)]
use graphein_common::{HandlerResponse, response::ResponseBuilder};

pub(super) fn expand_router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/google/init", get(get_init_google_oauth))
        .route("/google/code", get(get_finish_google_oauth))
        .route("/signout", post(post_signout))
        .merge(expand_auth_debug_router(state))
}

#[cfg(debug_assertions)]
fn expand_auth_debug_router(state: AppState) -> Router<AppState> {
    use axum::middleware;
    use graphein_common::middleware::requires_onboarding;

    Router::new()
        .route("/debug/session", get(get_debug_session))
        .route(
            "/debug/onboard",
            get(get_debug_onboard)
                .route_layer(middleware::from_fn_with_state(state, requires_onboarding)),
        )
}

#[cfg(not(debug_assertions))]
fn expand_auth_debug_router(_: AppState) -> Router<AppState> {
    Router::new()
}

#[cfg(debug_assertions)]
async fn get_debug_session(session: Session) -> HandlerResponse<Session> {
    Ok(ResponseBuilder::new().data(session).build())
}

#[cfg(debug_assertions)]
async fn get_debug_onboard(session: Session) -> HandlerResponse<Session> {
    Ok(ResponseBuilder::new().data(session).build())
}

async fn post_signout(
    State(AppState { sessions, .. }): State<AppState>,
    _: Session,
    cookies: CookieJar,
) -> Result<(StatusCode, CookieJar), AppError> {
    sessions
        .remove(
            cookies
                .get("session_token")
                .ok_or(AuthError::MissingAuth)?
                .value_trimmed(),
        )
        .await?;

    Ok((
        StatusCode::NO_CONTENT,
        cookies.remove("session_token").remove("is_onboarded"),
    ))
}

async fn get_init_google_oauth(
    State(AppState {
        config,
        oauth_states,
        ..
    }): State<AppState>,
    QsQuery(GoogleOAuthInitParams { as_merchant }): QsQuery<GoogleOAuthInitParams>,
) -> Result<Redirect, AppError> {
    let config2 = Arc::clone(&config);
    let (nonce, state, hmac) = tokio::task::spawn_blocking(move || {
        let mut rng = StdRng::from_os_rng();
        let mut nonce = [0u8; 16];
        rng.fill_bytes(&mut nonce);

        let mut state = [0u8; 32];
        rng.fill_bytes(&mut state);

        let hmac = hmac_sign(config2.secret().as_bytes(), state);

        (hex::encode(nonce), state, hmac)
    })
    .await?;

    let mut oauth_states = oauth_states.lock().await;
    oauth_states.push((nonce.clone(), state));
    drop(oauth_states);

    let oauth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?{}",
        serde_qs::to_string(&GoogleOAuthReqParams {
            client_id: config.google_oauth_client_id(),
            nonce,
            response_type: "code",
            redirect_uri: format!("{}/auth/google/code", config.root_uri()),
            scope: "openid email profile",
            state: format!("{}.{hmac}", hex::encode(state)),
            access_type: "online",
            hd: if as_merchant { "" } else { "sk.ac.th" },
            include_granted_scopes: true,
            prompt: "select_account",
        })
        .map_err(anyhow::Error::msg)?
    );

    Ok(Redirect::to(&oauth_url))
}

async fn get_finish_google_oauth(
    State(AppState {
        config,
        pool,
        http,
        sessions,
        oauth_states,
        ..
    }): State<AppState>,
    cookies: CookieJar,
    QsQuery(GoogleOAuthCodeExchangeParams { state, code }): QsQuery<GoogleOAuthCodeExchangeParams>,
) -> Response {
    let work = async || -> Result<(UserId, UserRole, bool, Duration), AppError> {
        let (state, hmac) = state
            .split_once('.')
            .map(|(state, hmac)| (hex::decode(state), hex::decode(hmac)))
            .ok_or(AuthError::InvalidOAuthFlow)?;
        let (state, hmac) = (state?, hmac?);

        let mut oauth_states = oauth_states.lock().await;
        let idx = oauth_states
            .iter()
            .position(|stored| stored.1 == state[..])
            .ok_or(AuthError::InvalidOAuthFlow)?;
        let (nonce, _) = oauth_states.remove(idx);
        drop(oauth_states);

        let config2 = Arc::clone(&config);
        tokio::task::spawn_blocking(move || {
            hmac_verify(config2.secret().as_bytes(), &state[..], &hmac[..])
        })
        .await??;

        let id_token = http
            .post("https://oauth2.googleapis.com/token")
            .json(&json!({
                "client_id": config.google_oauth_client_id(),
                "client_secret": config.google_oauth_client_secret(),
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": format!("{}/auth/google/code", config.root_uri()),
            }))
            .send()
            .await?
            .json::<IdToken>()
            .await?
            .id_token;

        let config2 = Arc::clone(&config);
        let decoded = tokio::task::spawn_blocking(move || {
            decode_and_verify_id_token(
                &id_token,
                &GOOGLE_SIGNING_KEYS,
                &nonce,
                config2.google_oauth_client_id(),
            )
        })
        .await??;

        let mut conn = pool.acquire().await?;
        let session_expiry = config.session_expiry_time();
        let (user_id, user_role, user_is_onboarded) = UsersTable::get_or_create_user_for_session(
            &mut conn,
            &decoded.email,
            &decoded.email_domain,
            &decoded.name,
            &decoded.profile_url,
        )
        .await?;

        Ok((user_id, user_role, user_is_onboarded, session_expiry))
    };

    match work().await {
        Ok((user_id, user_role, user_is_onboarded, session_expiry)) => (
            cookies.add(
                Cookie::build((
                    "session_token",
                    sessions.issue(user_id, user_role, user_is_onboarded).await,
                ))
                .http_only(true)
                .max_age(session_expiry.try_into().unwrap())
                .path("/")
                .same_site(SameSite::Strict)
                .secure(true),
            ),
            Html(include_str!("../pages/oauth_success.html")),
        )
            .into_response(),

        #[cfg(debug_assertions)]
        Err(error) => error.into_response(),

        #[cfg(not(debug_assertions))]
        Err(error) => (
            error.to_status_code(),
            Html(include_str!("../pages/oauth_failure.html")),
        )
            .into_response(),
    }
}
