use std::{sync::Arc, time::Duration};

use axum::{
    extract::State,
    response::{Html, IntoResponse as _, Redirect, Response},
};
use axum_extra::extract::{
    CookieJar,
    cookie::{Cookie, SameSite},
};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use serde_json::json;
use uuid::Uuid;

use crate::schemas::{User, UsersTable, enums::UserRole};
use graphein_common::{
    AppError, AppState, HandlerResponse, HandlerResult,
    auth::{
        GoogleOAuthCodeExchangeParams, GoogleOAuthInitParams, GoogleOAuthReqParams, IdToken,
        Session, decode_and_verify_id_token, hmac_sign, hmac_verify,
    },
    dto::{FetchLevel, ResponseBody},
    error::AuthError,
    extract::{QsQuery, RequiresOnboarding},
    response::ResponseBuilder,
};

#[cfg(debug_assertions)]
pub(super) async fn get_debug_session(session: Session) -> HandlerResponse<Session> {
    Ok(ResponseBuilder::new().data(session).build())
}

#[cfg(debug_assertions)]
pub(super) async fn get_debug_onboard(
    session: Session,
    _: RequiresOnboarding,
) -> HandlerResponse<Session> {
    Ok(ResponseBuilder::new().data(session).build())
}

pub(super) async fn get_user(
    State(AppState { pool, .. }): State<AppState>,
    Session { user_id, .. }: Session,
) -> HandlerResponse<User> {
    let mut conn = pool.acquire().await?;
    let user = User::fetch_one(&mut conn, user_id)
        .await?
        .into_model_variant(
            &mut conn,
            graphein_common::dto::FetchLevel::Default,
            FetchLevel::IdOnly,
        )
        .await?;

    Ok(ResponseBuilder::new().data(user).build())
}

pub(super) async fn post_signout(
    State(AppState { sessions, .. }): State<AppState>,
    _: Session,
    cookies: CookieJar,
) -> HandlerResult<(CookieJar, ResponseBody<()>)> {
    sessions
        .remove(
            cookies
                .get("sessionToken")
                .ok_or(AuthError::MissingAuth)?
                .value_trimmed(),
        )
        .await?;

    Ok((
        cookies.remove("sessionToken").remove("isOnboarded"),
        ResponseBuilder::new().build(),
    ))
}

pub(super) async fn get_init_google_oauth(
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

pub(super) async fn get_finish_google_oauth(
    State(AppState {
        config,
        pool,
        http,
        sessions,
        oauth_states,
        google_signing_keys,
        ..
    }): State<AppState>,
    cookies: CookieJar,
    QsQuery(GoogleOAuthCodeExchangeParams { state, code }): QsQuery<GoogleOAuthCodeExchangeParams>,
) -> Response {
    let work = async || -> Result<(Uuid, bool, Duration), AppError> {
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
                &google_signing_keys,
                &nonce,
                config2.google_oauth_client_id(),
            )
        })
        .await??;

        let mut conn = pool.acquire().await?;
        let session_expiry = config.session_expiry_time();
        let (user_id, user_is_onboarded) =
            if let Some(user) = UsersTable::fetch_by_email(&mut conn, &decoded.email).await? {
                (user.id, user.is_onboarded)
            } else {
                let user_role = match decoded.email_domain.as_str() {
                    "student.sk.ac.th" => UserRole::Student,
                    "sk.ac.th" => UserRole::Teacher,
                    _ => {
                        return Err(AppError::Forbidden {
                            message: "Non-organization users may not sign-up for this service."
                                .to_string(),
                        });
                    }
                };

                (
                    UsersTable::create_new(
                        &mut conn,
                        user_role,
                        &decoded.email,
                        &decoded.name,
                        &decoded.profile_url,
                    )
                    .await?,
                    false,
                )
            };

        Ok((user_id, user_is_onboarded, session_expiry))
    };

    match work().await {
        Ok((user_id, user_is_onboarded, session_expiry)) => (
            cookies.add(
                Cookie::build((
                    "sessionToken",
                    sessions.issue(user_id, user_is_onboarded).await,
                ))
                .http_only(true)
                .max_age(session_expiry.try_into().unwrap())
                .path("/")
                .same_site(SameSite::Strict)
                .secure(true),
            ),
            Html(include_str!("oauth_success.html")),
        )
            .into_response(),

        #[cfg(debug_assertions)]
        Err(error) => error.into_response(),

        #[cfg(not(debug_assertions))]
        Err(_) => Html(include_str!("oauth_failure.html")).into_response(),
    }
}
