use std::{collections::HashMap, sync::Arc};

use anyhow::Result as AnyhowResult;
use chrono::{DateTime, TimeDelta, Utc};
use http::{
    HeaderMap,
    header::{CONTENT_LENGTH, CONTENT_TYPE},
};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use s3::{Bucket, Region, creds::Credentials};

use crate::{AppError, error::NotFoundError, schemas::enums::FileType};

#[derive(Clone, Debug)]
pub struct R2Bucket {
    inner: Arc<Bucket>,
}

impl R2Bucket {
    pub fn new(
        account_id: String,
        bucket_name: &str,
        access_key_id: &str,
        secret_access_key: &str,
    ) -> AnyhowResult<Self> {
        Ok(Self {
            inner: Bucket::new(
                bucket_name,
                Region::R2 { account_id },
                Credentials::new(
                    Some(access_key_id),
                    Some(secret_access_key),
                    None,
                    None,
                    None,
                )?,
            )?
            .with_path_style()
            .into(),
        })
    }

    pub async fn presign_get_file(
        &self,
        object_id: &str,
        filename: &str,
        filetype: FileType,
    ) -> Result<String, AppError> {
        let mut queries = HashMap::new();
        queries.insert(
            String::from("response-content-disposition"),
            format!("attachment; filename*=UTF-8''{filename}.{filetype}"),
        );

        Ok(self
            .inner
            .presign_get(format!("/{object_id}.{filetype}"), 3600, Some(queries))
            .await?)
    }

    pub async fn presign_get_file_thumbnail(
        &self,
        object_id: &str,
        filetype: FileType,
    ) -> Result<Option<String>, AppError> {
        if !self
            .inner
            .object_exists(format!("/{object_id}.{filetype}"))
            .await?
        {
            return Err(AppError::NotFound(NotFoundError::ResourceNotFound));
        }

        let thumbnail_path = format!("/{object_id}.t.webp");
        if !self.inner.object_exists(&thumbnail_path).await? {
            return Ok(None);
        }

        let mut queries = HashMap::new();
        queries.insert(
            String::from("response-content-disposition"),
            String::from("inline"),
        );

        Ok(Some(
            self.inner
                .presign_get(thumbnail_path, 3600, Some(queries))
                .await?,
        ))
    }

    pub async fn presign_put(
        &self,
        created_at: &DateTime<Utc>,
        filetype: FileType,
        length: u64,
    ) -> Result<(String, String), AppError> {
        // 50 MB
        if length > 50 * 1000000 {
            return Err(AppError::BadRequest("File size exceeded limit".into()));
        }

        let mut object_id = [0u8; 16];
        StdRng::from_os_rng().fill_bytes(&mut object_id);
        let object_id = hex::encode(object_id);
        let path = format!("/{}.{filetype}", &object_id);
        let expires_at = (TimeDelta::minutes(15) - (Utc::now() - *created_at)).num_seconds() as u32;
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, filetype.to_mime().parse().unwrap());
        headers.insert(CONTENT_LENGTH, length.to_string().parse().unwrap());

        Ok((
            object_id,
            self.inner
                .presign_put(path, expires_at, Some(headers), None)
                .await?,
        ))
    }
}
