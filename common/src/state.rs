use std::{
    sync::{Arc, LazyLock},
    time::Instant,
};

use arc_swap::ArcSwap;
use jsonwebtoken::jwk::JwkSet;
use reqwest::Client as ReqwestClient;
use sqlx::PgPool;
use tokio::sync::Mutex;

use crate::{Config, auth::SessionStore};

mod bucket;
mod drafts;

pub use bucket::R2Bucket;
pub(super) use drafts::DraftOrderStore;

pub static GOOGLE_SIGNING_KEYS: LazyLock<ArcSwap<JwkSet>> =
    LazyLock::new(|| ArcSwap::from_pointee(JwkSet { keys: Vec::new() }));

pub(crate) type OAuthStates = Vec<(String, [u8; 32], Instant)>; /* (nonce, state) */

#[derive(Debug, Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub pool: PgPool,
    pub http: ReqwestClient,
    pub bucket: R2Bucket,
    pub sessions: SessionStore,
    pub oauth_states: Arc<Mutex<OAuthStates>>,
    pub draft_orders: DraftOrderStore,
}

impl AppState {
    #[must_use]
    pub fn new(config: Arc<Config>, pool: PgPool, bucket: R2Bucket) -> Self {
        AppState {
            config: config.clone(),
            pool,
            http: ReqwestClient::new(),
            bucket,
            sessions: SessionStore::new(config.secret().as_bytes(), config.session_expiry_time()),
            oauth_states: Arc::new(Mutex::new(Vec::new())),
            draft_orders: DraftOrderStore::new(),
        }
    }

    pub async fn load_sessions(&self) {
        self.sessions.load(self.pool.clone()).await;
    }
}
