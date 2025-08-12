use std::{
    fmt::{Debug, Display},
    sync::Arc,
    time::Duration as StdDuration,
};

use anyhow::Result as AnyhowResult;
use bytes::Bytes;
use chrono::{DateTime, TimeDelta, Utc};
use http::header::CONTENT_TYPE;
use reqwest::Client as ReqwestClient;
use rusty_s3::{Bucket, Credentials, S3Action as _, UrlStyle, actions::ObjectIdentifier};
use scc::HashIndex;

use crate::{
    AppError,
    error::{BadRequestError, NotFoundError},
    schemas::enums::FileType,
};

const DEFAULT_SIGN_DURATION: StdDuration = StdDuration::from_secs(60);

#[derive(Clone, Debug)]
pub struct R2Bucket {
    http: ReqwestClient,
    inner: Arc<Bucket>,
    creds: Arc<Credentials>,
    presign_cache: Arc<HashIndex<String, (Arc<str>, DateTime<Utc>)>>,
}

impl R2Bucket {
    pub fn new(
        http: ReqwestClient,
        account_id: &str,
        bucket_name: String,
        access_key_id: &str,
        secret_access_key: &str,
    ) -> AnyhowResult<Self> {
        Ok(Self {
            http,
            inner: Arc::new(Bucket::new(
                format!("https://{account_id}.r2.cloudflarestorage.com").parse()?,
                UrlStyle::VirtualHost,
                bucket_name,
                "auto",
            )?),
            creds: Arc::new(Credentials::new(access_key_id, secret_access_key)),
            presign_cache: Arc::new(HashIndex::new()),
        })
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn exists(&self, object_key: &str, filetype: FileType) -> Result<(), AppError> {
        let url = self
            .inner
            .head_object(Some(&self.creds), &format!("/{object_key}.{filetype}"))
            .sign(DEFAULT_SIGN_DURATION);
        self.http.head(url).send().await?.error_for_status()?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn get_file_for_thumbnail_processing(
        &self,
        object_key: &str,
        filetype: FileType,
    ) -> Result<Bytes, AppError> {
        let url = self
            .inner
            .get_object(Some(&self.creds), &format!("/{object_key}.{filetype}"))
            .sign(DEFAULT_SIGN_DURATION);

        Ok(self
            .http
            .get(url)
            .send()
            .await?
            .error_for_status()?
            .bytes()
            .await?)
    }

    #[tracing::instrument(skip_all, err)]
    pub fn presign_get_file(
        &self,
        object_key: &str,
        filename: &str,
        filetype: FileType,
    ) -> Result<Arc<str>, AppError> {
        let object = format!("/{object_key}.{filetype}");
        if let Some(Some(presigned)) = self.presign_cache.peek_with(&object, |k, presigned| {
            if presigned.1 < Utc::now() {
                self.presign_cache.remove(k);
                None
            } else {
                Some(Arc::clone(&presigned.0))
            }
        }) {
            return Ok(presigned);
        }

        let expiry = Utc::now() + TimeDelta::hours(1);
        let mut get_object = self.inner.get_object(Some(&self.creds), &object);
        let query_params = get_object.query_mut();
        query_params.insert("response-cache-control", "must-revalidate, private");
        query_params.insert(
            "response-content-disposition",
            format!("attachment; filename*=UTF-8''{filename}.{filetype}"),
        );
        query_params.insert("response-content-type", filetype.to_mime());
        query_params.insert(
            "response-expires",
            expiry.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
        );
        let presigned = Arc::from(get_object.sign(StdDuration::from_secs(3600)).as_ref());
        self.presign_cache
            .insert(object, (Arc::clone(&presigned), expiry))
            .ok();

        Ok(presigned)
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn presign_get_file_thumbnail(
        &self,
        object_key: &str,
        filetype: FileType,
    ) -> Result<Option<Arc<str>>, AppError> {
        let thumbnail_object = format!("/{object_key}.t.webp");
        if let Some(Some(presigned)) =
            self.presign_cache
                .peek_with(&thumbnail_object, |k, presigned| {
                    if presigned.1 < Utc::now() {
                        self.presign_cache.remove(k);
                        None
                    } else {
                        Some(Arc::clone(&presigned.0))
                    }
                })
        {
            return Ok(Some(presigned));
        }

        if self.exists(object_key, filetype).await.is_err() {
            return Err(AppError::NotFound(NotFoundError::ResourceNotFound));
        }
        if self.exists(object_key, FileType::Webp).await.is_err() {
            return Ok(None);
        }

        let expiry = Utc::now() + TimeDelta::hours(1);
        let mut get_object = self.inner.get_object(Some(&self.creds), &thumbnail_object);
        let query_params = get_object.query_mut();
        query_params.insert(
            "response-cache-control",
            "max-age=3600, must-revalidate, private",
        );
        query_params.insert("response-content-disposition", "inline");
        query_params.insert("response-content-type", FileType::Webp.to_mime());
        query_params.insert(
            "response-expires",
            expiry.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
        );
        let presigned = Arc::from(get_object.sign(StdDuration::from_secs(3600)).as_ref());
        self.presign_cache
            .insert_async(thumbnail_object.clone(), (Arc::clone(&presigned), expiry))
            .await
            .ok();

        Ok(Some(presigned))
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn put_thumbnail(&self, buffer: Bytes, object_key: &str) -> Result<(), AppError> {
        let url = self
            .inner
            .put_object(Some(&self.creds), &format!("/{object_key}.t.webp"))
            .sign(DEFAULT_SIGN_DURATION);
        self.http
            .put(url)
            .header(CONTENT_TYPE, FileType::Webp.to_mime())
            .body(buffer)
            .send()
            .await?
            .error_for_status()?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub fn presign_put(
        &self,
        created_at: &DateTime<Utc>,
        filetype: FileType,
        length: u64,
        object_key: &str,
    ) -> Result<String, AppError> {
        // 50 MB
        if length > 50 * 1_000_000 {
            return Err(AppError::BadRequest(BadRequestError::MalformedFiles(
                "File size exceeded limit.",
            )));
        }

        let object = format!("/{object_key}.{filetype}");
        let expiry = (TimeDelta::minutes(15) - (Utc::now() - *created_at))
            .to_std()
            .unwrap();
        let mut put_object = self.inner.put_object(Some(&self.creds), &object);
        let headers = put_object.headers_mut();
        headers.insert("content-type", filetype.to_mime());
        headers.insert("content-length", length.to_string());

        Ok(put_object.sign(expiry).into())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn delete_file(&self, object_key: &str, filetype: FileType) -> Result<(), AppError> {
        let objects = [
            ObjectIdentifier::new(format!("/{object_key}.{filetype}")),
            ObjectIdentifier::new(format!("/{object_key}.t.webp")),
        ];

        let mut delete_objects = self.inner.delete_objects(Some(&self.creds), objects.iter());
        delete_objects.set_quiet(true);
        let url = delete_objects.sign(DEFAULT_SIGN_DURATION);
        let (body, content_md5) = delete_objects.body_with_md5();
        self.http
            .post(url)
            .header(CONTENT_TYPE, "application/xml")
            .header("content-md5", content_md5)
            .body(body)
            .send()
            .await?
            .error_for_status()?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn delete_files<S: AsRef<str> + Display>(
        &self,
        files: &[(S, FileType)],
    ) -> Result<(), AppError> {
        let objects = files
            .iter()
            .flat_map(|(object_key, filetype)| {
                [
                    ObjectIdentifier::new(format!("/{object_key}.{filetype}")),
                    ObjectIdentifier::new(format!("/{object_key}.t.webp")),
                ]
            })
            .collect::<Vec<ObjectIdentifier>>();

        let mut delete_objects = self.inner.delete_objects(Some(&self.creds), objects.iter());
        delete_objects.set_quiet(true);
        let url = delete_objects.sign(DEFAULT_SIGN_DURATION);
        let (body, content_md5) = delete_objects.body_with_md5();
        self.http
            .post(url)
            .header(CONTENT_TYPE, "application/xml")
            .header("content-md5", content_md5)
            .body(body)
            .send()
            .await?
            .error_for_status()?;

        Ok(())
    }
}
