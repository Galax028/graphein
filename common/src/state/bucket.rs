use std::{collections::HashMap, sync::Arc};

use anyhow::Result as AnyhowResult;
use chrono::{DateTime, TimeDelta, Utc};
use http::{
    HeaderMap,
    header::{CONTENT_LENGTH, CONTENT_TYPE},
};
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

    pub async fn exists(&self, object_key: &str, filetype: FileType) -> Result<(), AppError> {
        self.inner
            .object_exists(format!("{object_key}.{filetype}"))
            .await?;

        Ok(())
    }

    pub async fn presign_get_file(
        &self,
        object_key: &str,
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
            .presign_get(format!("/{object_key}.{filetype}"), 3600, Some(queries))
            .await?)
    }

    pub async fn presign_get_file_thumbnail(
        &self,
        object_key: &str,
        filetype: FileType,
    ) -> Result<Option<String>, AppError> {
        let file_exists = self
            .inner
            .object_exists(format!("/{object_key}.{filetype}"))
            .await?;
        if !file_exists {
            return Err(AppError::NotFound(NotFoundError::ResourceNotFound));
        }

        let thumbnail_path = format!("/{object_key}.t.webp");
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

    #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
    pub async fn presign_put(
        &self,
        created_at: &DateTime<Utc>,
        filetype: FileType,
        length: u64,
        object_key: &str,
    ) -> Result<String, AppError> {
        // 50 MB
        if length > 50 * 1_000_000 {
            return Err(AppError::BadRequest("File size exceeded limit".into()));
        }

        let path = format!("/{object_key}.{filetype}");
        let expires_at = (TimeDelta::minutes(15) - (Utc::now() - *created_at)).num_seconds() as u32;
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, filetype.to_mime().parse().unwrap());
        headers.insert(CONTENT_LENGTH, length.to_string().parse().unwrap());

        Ok(self
            .inner
            .presign_put(path, expires_at, Some(headers), None)
            .await?)
    }

    pub async fn delete_file(&self, object_key: &str, filetype: FileType) -> Result<(), AppError> {
        self.inner
            .delete_object(format!("/{object_key}.{filetype}"))
            .await?;
        self.inner
            .delete_object(format!("/{object_key}.t.webp"))
            .await?;

        Ok(())
    }
}
