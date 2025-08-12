use std::{
    sync::{Arc, Mutex as StdMutex},
    time::Duration as StdDuration,
};

use anyhow::Result as AnyhowResult;
use chrono::{DateTime, TimeDelta, Utc};
use futures::TryStreamExt as _;
use hmac::{Hmac, Mac as _};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use scc::HashMap as SccMap;
use serde::Serialize;
use sha2::Sha256;
use sqlx::PgPool;

use crate::{
    AppError, SqlxResult,
    error::AuthError,
    schemas::{UserId, enums::UserRole},
};

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub struct SessionId([u8; 8]);

impl SessionId {
    fn new(id: [u8; 8]) -> Self {
        Self(id)
    }

    #[tracing::instrument(skip_all, err)]
    fn new_from_str(session_id: &str) -> Result<Self, AuthError> {
        Ok(Self::new(
            hex::decode(session_id)?
                .try_into()
                .map_err(|_| AuthError::Unprocessable)?,
        ))
    }

    #[tracing::instrument(skip_all, err)]
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
    pub user_id: UserId,
    pub user_role: UserRole,
    pub is_onboarded: bool,
    issued_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
}

#[derive(Clone, Debug)]
pub struct SessionStore {
    store: Arc<SccMap<SessionId, Session>>,
    hmac_instance: Arc<StdMutex<Hmac<Sha256>>>,
    session_expiry_time: TimeDelta,
}

impl SessionStore {
    pub(crate) fn new(secret: &[u8], session_expiry_time: StdDuration) -> Self {
        Self {
            store: Arc::new(SccMap::new()),
            hmac_instance: Arc::new(StdMutex::new(Hmac::new_from_slice(secret).unwrap())),
            session_expiry_time: TimeDelta::from_std(session_expiry_time).unwrap(),
        }
    }

    /// Issues a new session in the session store and returns the session ID signed with HMAC.
    #[tracing::instrument(skip_all, err)]
    pub async fn issue(
        &self,
        user_id: UserId,
        user_role: UserRole,
        is_onboarded: bool,
    ) -> Result<String, AuthError> {
        let hmac_instance = Arc::clone(&self.hmac_instance);
        let (session_id, signature) = tokio::task::spawn_blocking(move || {
            let mut session_id = [0u8; 8];
            StdRng::from_os_rng().fill_bytes(&mut session_id);

            // we cannot use `.chain_update()` due to the way `StdMutex` works
            let mut hmac_instance = hmac_instance.lock().unwrap(); // Shouldn't be poisoned
            hmac_instance.update(&session_id);
            let signature: [u8; 32] = hmac_instance.finalize_reset().into_bytes().into();
            drop(hmac_instance);

            (SessionId::new(session_id), hex::encode(signature))
        })
        .await
        .map_err(|_| AuthError::Unprocessable)?;

        let issued_at = Utc::now();
        self.store
            .upsert_async(
                session_id,
                Session {
                    user_id,
                    user_role,
                    is_onboarded,
                    issued_at,
                    expires_at: issued_at + self.session_expiry_time,
                },
            )
            .await;

        Ok(format!(
            "{}.{signature}",
            hex::encode(session_id.as_slice())
        ))
    }

    /// Sets the `is_onboarded` value of a session to `true`.
    #[tracing::instrument(skip_all, err)]
    pub async fn set_onboard(&self, session_id: &str) -> Result<(), AuthError> {
        let (session_id, signature) = SessionId::new_from_token(session_id)?;
        self.verify_session_signature(session_id, signature).await?;

        self.store
            .update_async(&session_id, |_, session| session.is_onboarded = true)
            .await
            .ok_or(AuthError::MissingAuth)?;

        Ok(())
    }

    /// Retrieves a session from the session store. Will return an error if HMAC signature is
    /// incorrect or the session ID token is malformed.
    #[tracing::instrument(skip_all, err)]
    pub async fn get(&self, session_id: &str) -> Result<Session, AuthError> {
        let (session_id, signature) = SessionId::new_from_token(session_id)?;
        self.verify_session_signature(session_id, signature).await?;

        if self
            .store
            .remove_if_async(&session_id, |session| session.expires_at <= Utc::now())
            .await
            .is_some()
        {
            return Err(AuthError::MissingAuth);
        }

        let session = self
            .store
            .get_async(&session_id)
            .await
            .ok_or(AuthError::MissingAuth)?;

        Ok(*session)
    }

    /// Removes a session from the session store.
    #[tracing::instrument(skip_all, err)]
    pub async fn remove(&self, session_id: &str) -> Result<(), AuthError> {
        let (session_id, signature) = SessionId::new_from_token(session_id)?;
        self.verify_session_signature(session_id, signature).await?;

        self.store
            .remove_async(&session_id)
            .await
            .ok_or(AuthError::Unprocessable)?;

        Ok(())
    }

    /// Loads all the sessions from the database into the session store.
    #[tracing::instrument(skip_all, err)]
    pub async fn load(&self, pool: PgPool) -> AnyhowResult<()> {
        sqlx::query!(
            "\
            SELECT s.*, u.role AS \"role: UserRole\", u.is_onboarded \
            FROM sessions AS s \
                JOIN users AS u on u.id = s.user_id \
            WHERE s.expires_at > CURRENT_TIMESTAMP\
            "
        )
        .fetch(&pool)
        .err_into::<AppError>()
        .try_for_each_concurrent(None, async |session| {
            self.store
                .insert_async(
                    SessionId::new_from_str(&session.id)?,
                    Session {
                        user_id: session.user_id.into(),
                        user_role: session.role,
                        is_onboarded: session.is_onboarded,
                        issued_at: session.issued_at,
                        expires_at: session.expires_at,
                    },
                )
                .await
                .ok();

            Ok(())
        })
        .await?;

        sqlx::query("TRUNCATE sessions").execute(&pool).await?;

        tracing::debug!("loaded {} session(s) from database", self.store.len());
        Ok(())
    }

    /// Commits all the sessions in the session store into the database.
    #[tracing::instrument(skip_all, err)]
    pub async fn commit(&self, pool: PgPool) -> SqlxResult<()> {
        let now = Utc::now();
        self.store
            .retain_async(|_, session| session.expires_at > now)
            .await;

        let store_len = self.store.len();
        let mut session_ids = Vec::with_capacity(store_len);
        let mut user_ids = Vec::with_capacity(store_len);
        let mut issued_ats = Vec::with_capacity(store_len);
        let mut expires_ats = Vec::with_capacity(store_len);
        self.store.scan(|session_id, session| {
            session_ids.push(hex::encode(session_id.as_slice()));
            user_ids.push(session.user_id);
            issued_ats.push(session.issued_at);
            expires_ats.push(session.expires_at);
        });

        let rows_affected = sqlx::query(
            "\
            INSERT INTO sessions \
            SELECT * FROM UNNEST(\
                $1::text[],\
                $2::uuid[],\
                $3::timestamp with time zone[],\
                $4::timestamp with time zone[]\
            )\
            ",
        )
        .bind(&session_ids[..])
        .bind(&user_ids[..])
        .bind(&issued_ats[..])
        .bind(&expires_ats[..])
        .execute(&pool)
        .await?
        .rows_affected();

        tracing::debug!("committed {rows_affected} session(s) to database");

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    async fn verify_session_signature(
        &self,
        session_id: SessionId,
        signature: [u8; 32],
    ) -> Result<(), AuthError> {
        let hmac_instance = Arc::clone(&self.hmac_instance);

        tokio::task::spawn_blocking(move || {
            let mut hmac_instance = hmac_instance.lock().unwrap(); // Shouldn't be poisoned
            hmac_instance.update(session_id.as_slice());
            let res = hmac_instance
                .verify_slice_reset(&signature)
                .map_err(|_| AuthError::Unprocessable);
            drop(hmac_instance);

            res
        })
        .await
        .map_err(|_| AuthError::Unprocessable)?
    }
}
