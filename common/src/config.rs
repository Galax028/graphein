use std::{net::IpAddr, str::FromStr, sync::Arc, time::Duration as StdDuration};

use anyhow::{Context, Result};
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
}

impl Config {
    pub fn try_from_dotenv() -> Result<Arc<Self>> {
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

    pub fn database_connect_options(&self) -> Result<PgConnectOptions> {
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
}
