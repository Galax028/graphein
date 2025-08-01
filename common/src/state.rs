use std::{
    sync::{Arc, LazyLock},
    time::Instant,
};

use anyhow::Result as AnyhowResult;
use arc_swap::ArcSwap;
use jsonwebtoken::jwk::JwkSet;
use reqwest::Client as ReqwestClient;
use sqlx::PgPool;
use tokio::sync::Mutex;

use crate::{Config, auth::SessionStore};

mod bucket;
mod drafts;
mod thumbnailer;

pub use bucket::R2Bucket;
pub(super) use drafts::DraftOrderStore;
pub use thumbnailer::Thumbnailer;
pub(crate) use thumbnailer::vips_version_check;

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
    pub thumbnailer: Thumbnailer,
}

impl AppState {
    #[must_use]
    #[allow(clippy::needless_pass_by_value)]
    pub fn new(
        config: Arc<Config>,
        pool: PgPool,
        http: ReqwestClient,
        bucket: R2Bucket,
        thumbnailer: Thumbnailer,
    ) -> Self {
        AppState {
            config: config.clone(),
            pool,
            http,
            bucket,
            sessions: SessionStore::new(config.secret().as_bytes(), config.session_expiry_time()),
            oauth_states: Arc::new(Mutex::new(Vec::new())),
            draft_orders: DraftOrderStore::new(),
            thumbnailer,
        }
    }

    pub async fn load_sessions(&self) -> AnyhowResult<()> {
        self.sessions.load(self.pool.clone()).await
    }
}
