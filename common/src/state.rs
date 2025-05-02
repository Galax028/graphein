use std::sync::{Arc, LazyLock};

use arc_swap::ArcSwap;
use jsonwebtoken::jwk::JwkSet;
use reqwest::Client;
use sqlx::PgPool;
use tokio::sync::Mutex;

use crate::{Config, auth::SessionStore};

pub static GOOGLE_SIGNING_KEYS: LazyLock<ArcSwap<JwkSet>> =
    LazyLock::new(|| ArcSwap::from_pointee(JwkSet { keys: Vec::new() }));

type OAuthStates = Vec<(String, [u8; 32])>; /* (nonce, state) */

#[derive(Debug, Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub pool: PgPool,
    pub http: reqwest::Client,
    pub sessions: SessionStore,
    pub oauth_states: Arc<Mutex<OAuthStates>>,
}

impl AppState {
    #[must_use]
    pub fn new(config: Arc<Config>, pool: PgPool) -> Self {
        let secret = config.secret().to_owned();
        let session_expiry_time = config.session_expiry_time();

        AppState {
            config,
            pool,
            http: Client::new(),
            sessions: SessionStore::new(secret.as_bytes(), session_expiry_time),
            oauth_states: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn load_sessions(&self) {
        self.sessions.load(self.pool.clone()).await;
    }
}
