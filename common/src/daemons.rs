use std::{sync::Arc, time::Duration as StdDuration};

use anyhow::Context as _;
use jsonwebtoken::jwk::JwkSet;
use reqwest::{Client as ReqwestClient, header::CACHE_CONTROL};
use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::{
    AppState, GOOGLE_SIGNING_KEYS,
    state::{DraftOrderStore, OAuthStates},
};

#[derive(Debug)]
pub struct DaemonController {
    app_state: AppState,
    canceller: CancellationToken,
}

impl DaemonController {
    #[must_use]
    pub fn new(app_state: AppState) -> Self {
        Self {
            app_state,
            canceller: CancellationToken::new(),
        }
    }

    #[must_use]
    pub fn start_all(self) -> Self {
        tokio::spawn(fetch_google_jwks(
            self.app_state.http.clone(),
            self.canceller.clone(),
        ));

        tokio::spawn(clean_oauth_states(
            self.app_state.oauth_states.clone(),
            self.canceller.clone(),
        ));

        tokio::spawn(clean_draft_orders(
            self.app_state.draft_orders.clone(),
            self.canceller.clone(),
        ));

        self
    }

    pub fn stop_all(&self) {
        self.canceller.cancel();
    }
}

async fn fetch_google_jwks(http: ReqwestClient, token: CancellationToken) -> anyhow::Result<()> {
    async fn inner(http: ReqwestClient) -> anyhow::Result<()> {
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
            GOOGLE_SIGNING_KEYS.store(Arc::new(keys));
            info!("fetched OAuth signing keys successfully, sleeping for {max_age} second(s)");

            tokio::time::sleep(StdDuration::from_secs(max_age)).await;
        }
    }

    tokio::select! {
        () = token.cancelled() => Ok(()),
        res = inner(http) => res,
    }
}

async fn clean_oauth_states(oauth_states: Arc<Mutex<OAuthStates>>, token: CancellationToken) {
    async fn inner(oauth_states: Arc<Mutex<OAuthStates>>) {
        loop {
            let five_minutes = StdDuration::from_secs(60 * 5);
            let mut oauth_states = oauth_states.lock().await;
            oauth_states.retain(|(_, _, started_at)| started_at.elapsed() <= five_minutes);
            drop(oauth_states);

            tokio::time::sleep(StdDuration::from_secs(60)).await;
        }
    }

    tokio::select! {
        () = token.cancelled() => (),
        res = inner(oauth_states) => res,
    }
}

async fn clean_draft_orders(draft_orders: DraftOrderStore, token: CancellationToken) {
    async fn inner(draft_orders: DraftOrderStore) {
        loop {
            draft_orders.clear_expired();

            tokio::time::sleep(StdDuration::from_secs(60)).await;
        }
    }

    tokio::select! {
        () = token.cancelled() => (),
        res = inner(draft_orders) => res,
    }
}
