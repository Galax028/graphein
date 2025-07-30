use std::{collections::HashMap, sync::Arc};

use anyhow::Result as AnyhowResult;
use bytes::Bytes;
use chrono::{DateTime, TimeDelta, Utc};
use http::{
    HeaderMap,
    header::{CONTENT_LENGTH, CONTENT_TYPE},
};
use s3::{Bucket, Region, creds::Credentials, error::S3Error};

use crate::{AppError, error::NotFoundError, schemas::enums::FileType};

#[derive(Clone, Debug)]
pub struct R2Bucket {
    inner: Arc<Bucket>,
    bucket_name: Arc<str>,
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
                &bucket_name,
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
            bucket_name: Arc::from(bucket_name),
        })
    }

    pub async fn exists(&self, object_key: &str, filetype: FileType) -> Result<(), AppError> {
        self.inner
            .object_exists(format!("{object_key}.{filetype}"))
            .await?;

        Ok(())
    }

    pub async fn get_file_for_thumbnail_processing(
        &self,
        object_key: &str,
        filetype: FileType,
    ) -> Result<Bytes, S3Error> {
        Ok(self
            .inner
            .get_object(format!("/{object_key}.{filetype}"))
            .await?
            .into_bytes())
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
        let thumbnail_path = format!("/{object_key}.t.webp");
        let buckets = self.inner.list(object_key.to_string(), None).await?;
        let objects = buckets
            .iter()
            .filter_map(|b| (*b.name == *self.bucket_name).then_some(&b.contents))
            .flatten()
            .map(|o| o.key.as_str())
            .collect::<Vec<&str>>();

        if !objects.contains(&format!("{object_key}.{filetype}").as_str()) {
            return Err(AppError::NotFound(NotFoundError::ResourceNotFound));
        }
        if !objects.contains(&&thumbnail_path[1..]) {
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

    pub async fn put_thumbnail(&self, buffer: &[u8], object_key: &str) -> Result<(), S3Error> {
        self.inner
            .put_object(format!("/{object_key}.t.webp"), buffer)
            .await?;

        Ok(())
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
            return Err(AppError::BadRequest(
                "[4007] File size exceeded limit".into(),
            ));
        }

        let path = format!("/{object_key}.{filetype}");
        let expires_at = (TimeDelta::minutes(15) - (Utc::now() - *created_at)).num_seconds() as u32;
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, filetype.to_mime().parse().unwrap()); // Infallible
        headers.insert(CONTENT_LENGTH, length.to_string().parse().unwrap()); // Infallible

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
