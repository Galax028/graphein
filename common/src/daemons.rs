use std::{sync::Arc, thread, time::Duration as StdDuration};

use anyhow::{Context as _, Result as AnyhowResult};
use chrono::{DateTime, Utc};
use jsonwebtoken::jwk::JwkSet;
use libvips::VipsApp;
use reqwest::{Client as ReqwestClient, header::CACHE_CONTROL};
use tokio::{
    runtime::Handle,
    sync::{
        Mutex,
        mpsc::{Receiver, error::TryRecvError},
        oneshot::{self, Receiver as OneshotReceiver, Sender as OneshotSender},
    },
};
use tokio_util::sync::CancellationToken;

use crate::{
    AppState, GOOGLE_SIGNING_KEYS, R2Bucket, Thumbnailer,
    schemas::enums::FileType,
    state::{DraftOrderStore, OAuthStates, vips_version_check},
};

#[derive(Debug)]
pub struct DaemonController {
    app_state: AppState,
    canceller: CancellationToken,
    thumbnailer_canceller: Option<OneshotSender<()>>,
}

impl DaemonController {
    #[must_use]
    pub fn new(app_state: AppState) -> Self {
        Self {
            app_state,
            canceller: CancellationToken::new(),
            thumbnailer_canceller: None,
        }
    }

    #[must_use]
    pub fn start_all(
        mut self,
        handle: Handle,
        thumbnailer_rx: Receiver<(String, FileType)>,
    ) -> Self {
        tokio::task::Builder::new()
            .name("Google JWKS Fetcher")
            .spawn(fetch_google_jwks(
                self.app_state.http.clone(),
                self.canceller.clone(),
            ))
            .unwrap();

        tokio::task::Builder::new()
            .name("OAuth States Cleaner")
            .spawn(clean_oauth_states(
                Arc::clone(&self.app_state.oauth_states),
                self.canceller.clone(),
            ))
            .unwrap();

        tokio::task::Builder::new()
            .name("Draft Orders Cleaner")
            .spawn(clean_draft_orders(
                self.app_state.bucket.clone(),
                self.app_state.draft_orders.clone(),
                self.canceller.clone(),
            ))
            .unwrap();

        let bucket = self.app_state.bucket.clone();
        let thumbnail_size = self.app_state.config.thumbnail_size();
        let (thumbnail_canceller_tx, thumbnail_canceller_rx) = oneshot::channel();
        self.thumbnailer_canceller = Some(thumbnail_canceller_tx);
        thread::spawn(move || {
            thumbnailer_loop(
                handle,
                bucket,
                thumbnail_size,
                thumbnailer_rx,
                thumbnail_canceller_rx,
            )
            .expect("`Thumbnailer` thread panicked");
        });

        self
    }

    pub fn stop_all(self) {
        self.canceller.cancel();
        self.thumbnailer_canceller
            .expect("Tried to cancel `Thumbnailer` thread but canceller does not exist")
            .send(())
            .expect("Already cancelled `Thumbnailer` thread");
    }
}

async fn fetch_google_jwks(http: ReqwestClient, token: CancellationToken) -> AnyhowResult<()> {
    async fn inner(http: ReqwestClient) -> AnyhowResult<()> {
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
                .unwrap_or("3600")
                .parse::<u64>()?;

            let keys = res.json::<JwkSet>().await?;
            GOOGLE_SIGNING_KEYS.store(Arc::new(keys));
            tracing::info!(
                "fetched OAuth signing keys successfully, sleeping for {max_age} second(s)",
            );

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

async fn clean_draft_orders(
    bucket: R2Bucket,
    draft_orders: DraftOrderStore,
    token: CancellationToken,
) {
    async fn inner(bucket: R2Bucket, draft_orders: DraftOrderStore) {
        loop {
            draft_orders.clear_expired(&bucket).await;

            tokio::time::sleep(StdDuration::from_secs(60)).await;
        }
    }

    tokio::select! {
        () = token.cancelled() => (),
        res = inner(bucket, draft_orders) => res,
    }
}

#[allow(clippy::needless_pass_by_value)]
fn thumbnailer_loop(
    handle: Handle,
    bucket: R2Bucket,
    thumbnail_size: i32,
    mut thumbnailer_rx: Receiver<(String, FileType)>,
    mut token: OneshotReceiver<()>,
) -> AnyhowResult<()> {
    let mut processed: Vec<(Arc<str>, DateTime<Utc>)> = Vec::new();
    let vips_app = VipsApp::new("thumbnailer", false)?;
    vips_app.cache_set_max(16); // Max operations
    vips_app.cache_set_max_files(0); // Max open files
    vips_app.cache_set_max_mem(256); // Max allocation
    vips_app.concurrency_set(1); // Max workers
    vips_version_check(vips_app.version_string()?)?;

    while let Ok(()) | Err(oneshot::error::TryRecvError::Empty) = token.try_recv() {
        match thumbnailer_rx.try_recv() {
            Ok(data) => {
                if let Err(pos) =
                    processed.binary_search_by_key(&data.0.as_str(), |(string, _)| string)
                {
                    let to_be_processed: (Arc<str>, DateTime<Utc>) =
                        (Arc::from(data.0.as_str()), Utc::now());
                    processed.insert(pos, (Arc::clone(&to_be_processed.0), to_be_processed.1));

                    tracing::info_span!(
                        "thumbnailer",
                        object_key = %to_be_processed.0,
                        elapsed = tracing::field::Empty,
                    )
                    .in_scope(|| -> AnyhowResult<()> {
                        tracing::info!("start processing thumbnail");
                        let elapsed = Thumbnailer::process_single_thumbnail(
                            &handle,
                            &bucket,
                            thumbnail_size,
                            &to_be_processed.0,
                            data.1,
                        )?;
                        tracing::info!(?elapsed, "finished thumbnail processing");

                        Ok(())
                    })?;
                }
            }
            Err(TryRecvError::Empty) => {
                let now = Utc::now(); // I should really find a better way
                processed.retain(|(_, created_at)| (now - created_at).num_hours() <= 1);

                thread::sleep(StdDuration::from_millis(1));
            }
            Err(TryRecvError::Disconnected) => break,
        }
    }

    drop(vips_app);
    Ok(())
}
