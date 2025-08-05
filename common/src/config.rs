use std::{
    net::IpAddr,
    num::{NonZeroI32, NonZeroU32},
    str::FromStr,
    sync::Arc,
    time::Duration as StdDuration,
};

use anyhow::{Context as _, Result as AnyhowResult};
use chrono::FixedOffset;
use dotenvy::var;
use sqlx::postgres::PgConnectOptions;

#[derive(Debug)]
pub struct Config {
    host: IpAddr,
    port: u16,
    root_uri: String,
    frontend_uri: String,
    database_url: String,
    no_migrate: bool,
    secret: String,
    healthcheck_token: String,
    session_expiry_time: StdDuration,
    shop_utc_offset: FixedOffset,
    thumbnail_size: NonZeroU32,
    google_oauth_client_id: String,
    google_oauth_client_secret: String,
    r2_account_id: String,
    r2_bucket_name: String,
    r2_access_key_id: String,
    r2_secret_access_key: String,
}

impl Config {
    pub fn try_from_dotenv() -> AnyhowResult<Arc<Self>> {
        dotenvy::dotenv().ok();

        let host = IpAddr::from_str(&var("GRAPHEIN_HOST").unwrap_or(String::from("0.0.0.0")))
            .context("Invalid value for environment variable `GRAPHEIN_HOST`")?;
        let port = var("GRAPHEIN_PORT")
            .unwrap_or(String::from("8000"))
            .parse()
            .context("Invalid value for environment variable `GRAPHEIN_PORT`")?;
        let root_uri = var("ROOT_URI").unwrap_or(format!("http://{host}:{port}"));
        let frontend_uri =
            var("FRONTEND_URI").context("Missing environment variable `FRONTEND_URI`")?;
        let database_url =
            var("DATABASE_URL").context("Missing environment variable `DATABASE_URL`")?;
        let no_migrate = var("NO_MIGRATE")
            .unwrap_or(String::from("false"))
            .parse()
            .context("Invalid value for environment variable `NO_MIGRATE`")?;
        let secret = var("SECRET").context("Missing environment variable `SECRET`")?;
        let healthcheck_token =
            var("HEALTHCHECK_TOKEN").context("Missing environment variable `HEALTHCHECK_TOKEN`")?;
        let session_expiry_time = StdDuration::from_secs(
            var("SESSION_EXPIRY_TIME")
                .unwrap_or(String::from("604800")) // 1 Week
                .parse()
                .context("Invalid value for environment variable `SESSION_EXPIRY_TIME`")?,
        );
        let shop_utc_offset = var("SHOP_UTC_OFFSET")
            .unwrap_or(String::from("+0000"))
            .parse()
            .context("Invalid value for environment variable `SHOP_UTC_OFFSET`")?;
        let thumbnail_size = var("THUMBNAIL_SIZE")
            .unwrap_or(String::from("128"))
            .parse::<NonZeroI32>()
            .context("Invalid value for environment variable `THUMBNAIL_SIZE`")?
            .try_into()
            .context("Invalid value for environment variable `THUMBNAIL_SIZE`")?;
        let google_oauth_client_id = var("GOOGLE_OAUTH_CLIENT_ID")
            .context("Missing environment variable `GOOGLE_OAUTH_CLIENT_ID`")?;
        let google_oauth_client_secret = var("GOOGLE_OAUTH_CLIENT_SECRET")
            .context("Missing environment variable `GOOGLE_OAUTH_CLIENT_SECRET`")?;
        let r2_account_id =
            var("R2_ACCOUNT_ID").context("Missing environment variable `R2_ACCOUNT_ID")?;
        let r2_bucket_name =
            var("R2_BUCKET_NAME").context("Missing environment variable `R2_BUCKET_NAME")?;
        let r2_access_key_id =
            var("R2_ACCESS_KEY_ID").context("Missing environment variable `R2_ACCESS_KEY_ID")?;
        let r2_secret_access_key = var("R2_SECRET_ACCESS_KEY")
            .context("Missing environment variable `R2_SECRET_ACCESS_KEY")?;

        Ok(Arc::new(Config {
            host,
            port,
            root_uri,
            frontend_uri,
            database_url,
            no_migrate,
            secret,
            healthcheck_token,
            session_expiry_time,
            shop_utc_offset,
            thumbnail_size,
            google_oauth_client_id,
            google_oauth_client_secret,
            r2_account_id,
            r2_bucket_name,
            r2_access_key_id,
            r2_secret_access_key,
        }))
    }

    #[must_use]
    pub fn host(&self) -> IpAddr {
        self.host
    }

    #[must_use]
    pub fn port(&self) -> u16 {
        self.port
    }

    #[must_use]
    pub fn root_uri(&self) -> &str {
        &self.root_uri
    }

    #[must_use]
    pub fn frontend_uri(&self) -> &str {
        &self.frontend_uri
    }

    pub fn database_connect_options(&self) -> AnyhowResult<PgConnectOptions> {
        self.database_url
            .parse()
            .context("Invalid value for environment variable `DATABASE_URL`")
    }

    #[must_use]
    pub fn no_migrate(&self) -> bool {
        self.no_migrate
    }

    #[must_use]
    pub fn secret(&self) -> &str {
        &self.secret
    }

    #[must_use]
    pub fn healthcheck_token(&self) -> &str {
        &self.healthcheck_token
    }

    #[must_use]
    pub fn session_expiry_time(&self) -> StdDuration {
        self.session_expiry_time
    }

    #[must_use]
    pub fn shop_utc_offset(&self) -> FixedOffset {
        self.shop_utc_offset
    }

    #[must_use]
    #[allow(clippy::cast_possible_wrap)]
    pub fn thumbnail_size(&self) -> i32 {
        self.thumbnail_size.get() as i32
    }

    #[must_use]
    pub fn google_oauth_client_id(&self) -> &str {
        &self.google_oauth_client_id
    }

    #[must_use]
    pub fn google_oauth_client_secret(&self) -> &str {
        &self.google_oauth_client_secret
    }

    #[must_use]
    pub fn r2_account_id(&self) -> &str {
        &self.r2_account_id
    }

    #[must_use]
    pub fn r2_bucket_name(&self) -> &str {
        &self.r2_bucket_name
    }

    #[must_use]
    pub fn r2_access_key_id(&self) -> &str {
        &self.r2_access_key_id
    }

    #[must_use]
    pub fn r2_secret_access_key(&self) -> &str {
        &self.r2_secret_access_key
    }
}
