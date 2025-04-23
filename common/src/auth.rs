use std::{
    sync::{Arc, Mutex as StdMutex},
    time::Duration,
};

use anyhow::Context;
use arc_swap::ArcSwap;
use chrono::{DateTime, TimeDelta, Utc};
use dashmap::DashMap;
use hmac::{Hmac, Mac};
use jsonwebtoken::jwk::JwkSet;
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use reqwest::header::CACHE_CONTROL;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use sqlx::PgPool;
use tokio_util::sync::CancellationToken;
use tracing::info;
use uuid::Uuid;

use crate::{AppError, AppState, error::AuthError};

pub async fn fetch_google_jwks(
    app_state: AppState,
    cancellation_token: CancellationToken,
) -> anyhow::Result<()> {
    async fn inner(
        AppState {
            http,
            google_signing_keys,
            ..
        }: AppState,
    ) -> anyhow::Result<()> {
        loop {
            let res = http
                .get("https://www.googleapis.com/oauth2/v3/certs")
                .send()
                .await?;

            let max_age = res
                .headers()
                .get(CACHE_CONTROL)
                .context("`Cache-Control` header not present")?
                .to_str()?
                .split(", ")
                .find(|directive| directive.starts_with("max-age="))
                .context("`max-age` directive not present")?
                .strip_prefix("max-age=")
                .unwrap()
                .parse::<u64>()?;

            let keys = res.json::<JwkSet>().await?;
            google_signing_keys.store(Arc::new(keys));
            info!("fetched Google OAuth signing keys successfully, sleeping for {max_age} seconds");

            tokio::time::sleep(Duration::from_secs(max_age)).await;
        }
    }

    tokio::select! {
        () = cancellation_token.cancelled() => Ok(()),
        res = inner(app_state) => res,
    }
}

#[derive(Debug, Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct GoogleOAuthInitParams {
    pub as_merchant: bool,
}

#[derive(Debug, Serialize)]
pub struct GoogleOAuthReqParams<'a> {
    pub client_id: &'a str,
    pub nonce: String,
    pub response_type: &'static str,
    pub redirect_uri: String,
    pub scope: &'static str,
    pub state: String,
    pub access_type: &'static str,
    pub hd: &'static str,
    pub include_granted_scopes: bool,
    pub prompt: &'static str,
}

#[derive(Debug, Deserialize)]
pub struct GoogleOAuthCodeExchangeParams {
    pub state: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct IdToken {
    pub id_token: String,
}

#[derive(Debug, Deserialize)]
pub struct IdTokenPayload {
    pub email: String,
    pub name: String,
    #[serde(rename = "picture")]
    pub profile_url: String,

    pub nonce: String,
    #[serde(default, rename = "hd")]
    pub email_domain: String,
}

#[must_use]
pub fn hmac_sign(key: &[u8], state: [u8; 32]) -> String {
    let hmac = Hmac::<Sha256>::new_from_slice(key)
        .unwrap()
        .chain_update(state)
        .finalize()
        .into_bytes();

    format!("{hmac:x}")
}

pub fn hmac_verify(key: &[u8], state: &[u8], sig: &[u8]) -> Result<(), AuthError> {
    Hmac::<Sha256>::new_from_slice(key)
        .unwrap()
        .chain_update(state)
        .verify_slice(sig)
        .map_err(|_| AuthError::InvalidOAuthFlow)
}

pub fn decode_and_verify_id_token(
    id_token: &str,
    jwks: &ArcSwap<JwkSet>,
    nonce: &str,
    google_oauth_client_id: &str,
) -> Result<IdTokenPayload, AppError> {
    let id_token_headers = jsonwebtoken::decode_header(id_token)?;
    let kid = id_token_headers.kid.ok_or(AuthError::InvalidOAuthFlow)?;

    let google_signing_keys = jwks.load();
    let decoding_key = jsonwebtoken::DecodingKey::from_jwk(
        google_signing_keys
            .find(&kid)
            .ok_or(AuthError::InvalidOAuthFlow)?,
    )?;
    drop(google_signing_keys);

    let mut validation = jsonwebtoken::Validation::new(id_token_headers.alg);
    validation.set_audience(&[google_oauth_client_id]);
    validation.set_issuer(&["accounts.google.com", "https://accounts.google.com"]);

    let payload =
        jsonwebtoken::decode::<IdTokenPayload>(id_token, &decoding_key, &validation)?.claims;
    if payload.nonce == nonce {
        Ok(payload)
    } else {
        Err(AuthError::InvalidOAuthFlow.into())
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub struct SessionId([u8; 8]);

impl SessionId {
    fn new(id: [u8; 8]) -> Self {
        Self(id)
    }

    fn new_from_str(session_id: &str) -> Result<Self, AuthError> {
        Ok(Self::new(
            hex::decode(session_id)?
                .try_into()
                .map_err(|_| AuthError::Unprocessable)?,
        ))
    }

    fn new_from_token(session_token: &str) -> Result<(Self, [u8; 32]), AuthError> {
        let (id, signature) = session_token
            .split_once('.')
            .ok_or(AuthError::Unprocessable)?;

        Ok((
            Self::new_from_str(id)?,
            hex::decode(signature)?
                .try_into()
                .map_err(|_| AuthError::Unprocessable)?,
        ))
    }

    fn as_slice(&self) -> &[u8] {
        &self.0
    }
}

#[derive(Clone, Copy, Debug, Serialize)]
pub struct Session {
    pub user_id: Uuid,
    pub is_onboarded: bool,
    issued_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
}

#[derive(Clone, Debug)]
pub struct SessionStore {
    store: Arc<DashMap<SessionId, Session>>,
    hmac_instance: Arc<StdMutex<Hmac<Sha256>>>,
    session_expiry_time: TimeDelta,
}

impl SessionStore {
    pub(crate) fn new(secret: &[u8], session_expiry_time: Duration) -> Self {
        Self {
            store: Arc::new(DashMap::new()),
            hmac_instance: Arc::new(StdMutex::new(Hmac::new_from_slice(secret).unwrap())),
            session_expiry_time: TimeDelta::from_std(session_expiry_time).unwrap(),
        }
    }

    /// Issues a new session in the session store and returns the session ID signed with HMAC.
    pub async fn issue(&self, user_id: Uuid, is_onboarded: bool) -> String {
        let hmac_instance = self.hmac_instance.clone();
        let (session_id, signature) = tokio::task::spawn_blocking(move || {
            let mut session_id = [0u8; 8];
            StdRng::from_os_rng().fill_bytes(&mut session_id);

            // we cannot use `.chain_update()` due to the way `StdMutex` works
            let mut hmac_instance = hmac_instance.lock().unwrap();
            hmac_instance.update(&session_id);
            let signature: [u8; 32] = hmac_instance.finalize_reset().into_bytes().into();
            drop(hmac_instance);

            (SessionId::new(session_id), hex::encode(signature))
        })
        .await
        .unwrap();

        let issued_at = Utc::now();
        self.store.insert(
            session_id,
            Session {
                user_id,
                is_onboarded,
                issued_at,
                expires_at: issued_at + self.session_expiry_time,
            },
        );

        format!("{}.{signature}", hex::encode(session_id.as_slice()))
    }

    /// Retrieves a session from the session store. Will return an error if HMAC signature is
    /// incorrect or the session ID token is malformed.
    pub async fn get(&self, session_id: &str) -> Result<Session, AuthError> {
        let (session_id, signature) = SessionId::new_from_token(session_id)?;
        self.verify_session_signature(session_id, signature).await?;

        let session = self.store.get(&session_id).ok_or(AuthError::MissingAuth)?;
        if session.expires_at <= Utc::now() {
            self.store.remove(&session_id);

            return Err(AuthError::MissingAuth);
        }

        Ok(*session)
    }

    /// Removes a session from the session store.
    pub async fn remove(&self, session_id: &str) -> Result<(), AuthError> {
        let (session_id, signature) = SessionId::new_from_token(session_id)?;
        self.verify_session_signature(session_id, signature).await?;

        self.store
            .remove(&session_id)
            .ok_or(AuthError::Unprocessable)?;

        Ok(())
    }

    /// Loads all the sessions from the database into the session store.
    pub async fn load(&self, pool: PgPool) {
        sqlx::query!(
            "\
            SELECT s.*, u.is_onboarded FROM sessions AS s \
            JOIN users AS u on u.id = s.user_id WHERE s.expires_at > CURRENT_TIMESTAMP\
            "
        )
        .fetch_all(&pool)
        .await
        .unwrap()
        .into_iter()
        .for_each(|session| {
            self.store.insert(
                SessionId::new_from_str(&session.id).unwrap(),
                Session {
                    user_id: session.user_id,
                    is_onboarded: session.is_onboarded,
                    issued_at: session.issued_at,
                    expires_at: session.expires_at,
                },
            );
        });

        sqlx::query!("TRUNCATE sessions")
            .execute(&pool)
            .await
            .unwrap();

        tracing::debug!("loaded {} session(s) from database", self.store.len());
    }

    /// Commits all the sessions in the session store into the database.
    pub async fn commit(&self, pool: PgPool) {
        let now = Utc::now();
        self.store.retain(|_, session| session.expires_at > now);

        let (session_ids, (user_ids, issued_ats, expires_ats)): (Vec<_>, (Vec<_>, Vec<_>, Vec<_>)) =
            self.store
                .iter()
                .map(|session| {
                    (
                        hex::encode(session.key().as_slice()),
                        (session.user_id, session.issued_at, session.expires_at),
                    )
                })
                .unzip();

        sqlx::query!(
            "\
            INSERT INTO sessions \
            SELECT * FROM UNNEST(\
                $1::text[],\
                $2::uuid[],\
                $3::timestamp with time zone[],\
                $4::timestamp with time zone[]\
            )\
            ",
            &session_ids[..],
            &user_ids[..],
            &issued_ats[..],
            &expires_ats[..],
        )
        .execute(&pool)
        .await
        .unwrap();

        tracing::debug!("committed {} session(s) to database", self.store.len());
    }

    async fn verify_session_signature(
        &self,
        session_id: SessionId,
        signature: [u8; 32],
    ) -> Result<(), AuthError> {
        let hmac_instance = self.hmac_instance.clone();

        tokio::task::spawn_blocking(move || {
            let mut hmac_instance = hmac_instance.lock().unwrap();
            hmac_instance.update(session_id.as_slice());
            let res = hmac_instance
                .verify_slice_reset(&signature)
                .map_err(|_| AuthError::Unprocessable);
            drop(hmac_instance);

            res
        })
        .await
        .unwrap()
    }
}
