use std::{net::IpAddr, str::FromStr, time::Duration};

use anyhow::Result;
use dotenvy::var;

#[derive(Debug, Clone)]
pub struct Config {
    host: IpAddr,
    port: u16,
    root_uri: String,
    database_url: String,
    secret: String,
    session_expiry_time: Duration,
    google_oauth_client_id: String,
    google_oauth_client_secret: String,
}

impl Config {
    pub fn try_from_dotenv() -> Result<Self> {
        dotenvy::dotenv()?;

        let host = IpAddr::from_str(&var("HOST")?)?;
        let port = var("PORT")?.parse()?;
        let root_uri = var("ROOT_URI")?;
        let database_url = var("DATABASE_URL")?;
        let secret = var("SECRET")?;
        let session_expiry_time = Duration::from_secs(var("SESSION_EXPIRY_TIME")?.parse()?);
        let google_oauth_client_id = var("GOOGLE_OAUTH_CLIENT_ID")?;
        let google_oauth_client_secret = var("GOOGLE_OAUTH_CLIENT_SECRET")?;

        Ok(Config {
            host,
            port,
            root_uri,
            database_url,
            secret,
            session_expiry_time,
            google_oauth_client_id,
            google_oauth_client_secret,
        })
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
    pub fn database_url(&self) -> &str {
        &self.database_url
    }

    #[must_use]
    pub fn secret(&self) -> &str {
        &self.secret
    }

    #[must_use]
    pub fn session_expiry_time(&self) -> Duration {
        self.session_expiry_time
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
