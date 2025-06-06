use arc_swap::ArcSwap;
use hmac::{Hmac, Mac as _};
use jsonwebtoken::jwk::JwkSet;
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use crate::{AppError, error::AuthError};

#[derive(Debug, Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct GoogleOAuthInitParams {
    pub as_merchant: bool,
}

#[derive(Debug, Serialize)]
pub struct GoogleOAuthReqParams<'a> {
    pub client_id: &'a str,
    pub nonce: &'a str,
    pub response_type: &'static str,
    pub redirect_uri: String,
    pub scope: &'static str,
    pub state: String,
    pub access_type: &'static str,
    pub hd: &'static str,
    pub include_granted_scopes: bool,
    pub prompt: &'static str,
}

#[derive(Debug, Deserialize)]
pub struct GoogleOAuthCodeExchangeParams {
    pub state: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct IdToken {
    pub id_token: String,
}

#[derive(Debug, Deserialize)]
pub struct IdTokenPayload {
    pub email: String,
    pub name: String,
    #[serde(rename = "picture")]
    pub profile_url: String,

    pub nonce: String,
    #[serde(default, rename = "hd")]
    pub email_domain: String,
}

#[must_use]
pub fn hmac_sign(key: &[u8], state: [u8; 32]) -> String {
    let hmac = Hmac::<Sha256>::new_from_slice(key)
        .unwrap() // Infallible
        .chain_update(state)
        .finalize()
        .into_bytes();

    format!("{hmac:x}")
}

pub fn hmac_verify(key: &[u8], state: &[u8], sig: &[u8]) -> Result<(), AuthError> {
    Hmac::<Sha256>::new_from_slice(key)
        .unwrap() // Infallible
        .chain_update(state)
        .verify_slice(sig)
        .map_err(|_| AuthError::InvalidOAuthFlow)
}

pub fn decode_and_verify_id_token(
    id_token: &str,
    jwks: &ArcSwap<JwkSet>,
    nonce: &str,
    google_oauth_client_id: &str,
) -> Result<IdTokenPayload, AppError> {
    let id_token_headers = jsonwebtoken::decode_header(id_token)?;
    let kid = id_token_headers.kid.ok_or(AuthError::InvalidOAuthFlow)?;

    let google_signing_keys = jwks.load();
    let decoding_key = jsonwebtoken::DecodingKey::from_jwk(
        google_signing_keys
            .find(&kid)
            .ok_or(AuthError::InvalidOAuthFlow)?,
    )?;
    drop(google_signing_keys);

    let mut validation = jsonwebtoken::Validation::new(id_token_headers.alg);
    validation.set_audience(&[google_oauth_client_id]);
    validation.set_issuer(&["accounts.google.com", "https://accounts.google.com"]);

    let payload =
        jsonwebtoken::decode::<IdTokenPayload>(id_token, &decoding_key, &validation)?.claims;
    if payload.nonce == nonce {
        Ok(payload)
    } else {
        Err(AuthError::InvalidOAuthFlow.into())
    }
}
