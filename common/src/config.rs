use std::{net::IpAddr, str::FromStr, sync::Arc, time::Duration as StdDuration};

use anyhow::{Context as _, Result as AnyhowResult};
use chrono::FixedOffset;
use dotenvy::var;
use sqlx::postgres::PgConnectOptions;

#[derive(Debug, Clone)]
pub struct Config {
    host: IpAddr,
    port: u16,
    root_uri: String,
    database_url: String,
    secret: String,
    session_expiry_time: StdDuration,
    shop_utc_offset: FixedOffset,
    google_oauth_client_id: String,
    google_oauth_client_secret: String,
    r2_account_id: String,
    r2_bucket_name: String,
    r2_access_key_id: String,
    r2_secret_access_key: String,
}

impl Config {
    pub fn try_from_dotenv() -> AnyhowResult<Arc<Self>> {
        dotenvy::dotenv()?;

        let host = IpAddr::from_str(&var("HOST").context("Missing environment variable `HOST`")?)
            .context("Invalid value for environment variable ``")?;
        let port = var("PORT")
            .context("Missing environment variable `PORT`")?
            .parse()
            .context("Invalid value for environment variable `PORT`")?;
        let root_uri = var("ROOT_URI").context("Missing environment variable `ROOT_URI`")?;
        let database_url =
            var("DATABASE_URL").context("Missing environment variable `DATABASE_URL`")?;
        let secret = var("SECRET").context("Missing environment variable `SECRET`")?;
        let session_expiry_time = StdDuration::from_secs(
            var("SESSION_EXPIRY_TIME")
                .context("Missing environment variable `SESSION_EXPIRY_TIME`")?
                .parse()
                .context("Invalid value for environment variable `SESSION_EXPIRY_TIME`")?,
        );
        let shop_utc_offset = var("SHOP_UTC_OFFSET")
            .context("Missing environment variable `SHOP_UTC_OFFSET`")?
            .parse()
            .context("Invalid value for environment variable `SHOP_UTC_OFFSET`")?;
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
            database_url,
            secret,
            session_expiry_time,
            shop_utc_offset,
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

    pub fn database_connect_options(&self) -> AnyhowResult<PgConnectOptions> {
        self.database_url
            .parse()
            .context("Invalid value for environment variable `DATABASE_URL`")
    }

    #[must_use]
    pub fn secret(&self) -> &str {
        &self.secret
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
