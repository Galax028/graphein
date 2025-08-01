use std::sync::{
    Arc,
    atomic::{AtomicU16, Ordering},
};

use chrono::{DateTime, Utc};
use futures::stream::{self, TryStreamExt as _};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use scc::{HashMap as SccMap, hash_map::OccupiedEntry};
use uuid::Uuid;

use crate::{
    AppError, MAX_FILE_LIMIT,
    error::NotFoundError,
    schemas::{
        DetailedOrder, File, FileId, FileRange, OrderCreate, OrderId, UserId,
        enums::{FileType, OrderStatus},
    },
};

use super::R2Bucket;

const MAX_QUEUE_SEQ: u16 = 25974; /* 26 * 999 */
const MAX_FILE_RANGES: usize = 5;

#[derive(Debug)]
pub struct DraftFile {
    pub id: FileId,
    pub filetype: FileType,
    pub filesize: u64,
    pub object_key: String,
}

#[derive(Debug)]
pub struct DraftOrder {
    id: OrderId,
    created_at: DateTime<Utc>,
    pub files: Vec<DraftFile>,
}

impl DraftOrder {
    #[must_use]
    fn new(id: OrderId) -> Self {
        Self {
            id,
            created_at: Utc::now(),
            files: Vec::with_capacity(MAX_FILE_LIMIT),
        }
    }

    #[must_use]
    fn files_len(&self) -> usize {
        self.files.len()
    }

    #[must_use]
    fn contains_file(&self, id: FileId) -> bool {
        self.files.iter().any(|file| file.id == id)
    }

    #[must_use]
    fn add_file(&mut self, id: FileId, filetype: FileType, filesize: u64) -> String {
        let mut object_key = [0u8; 16];
        StdRng::from_os_rng().fill_bytes(&mut object_key);
        let object_key = hex::encode(object_key);
        self.files.push(DraftFile {
            id,
            filetype,
            filesize,
            object_key: object_key.clone(),
        });

        object_key
    }

    fn remove_file(&mut self, id: FileId) {
        self.files.retain(|file| file.id != id);
    }
}

#[derive(Clone, Debug)]
pub struct DraftOrderStore {
    orders: Arc<SccMap<UserId, DraftOrder>>,
    queue: Arc<AtomicU16>,
}

impl DraftOrderStore {
    #[must_use]
    pub(super) fn new() -> Self {
        Self {
            orders: Arc::new(SccMap::new()),
            queue: Arc::new(AtomicU16::new(1)),
        }
    }

    pub async fn insert(&self, owner_id: UserId) -> OrderId {
        if let Some(draft_id) = self.orders.read_async(&owner_id, |_, draft| draft.id).await {
            return draft_id;
        }

        let order_id = Uuid::new_v4().into();
        self.orders
            .insert_async(owner_id, DraftOrder::new(order_id))
            .await
            .ok();

        order_id
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn add_file(
        &self,
        owner_id: UserId,
        filetype: FileType,
        filesize: u64,
    ) -> Result<(FileId, String), AppError> {
        let mut draft = self
            .orders
            .get_async(&owner_id)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        if draft.files_len() == MAX_FILE_LIMIT {
            return Err(AppError::BadRequest(
                "[4008] This order has already reached the maximum file limit.".into(),
            ));
        }

        let file_id = Uuid::new_v4().into();
        let object_key = draft.add_file(file_id, filetype, filesize);

        Ok((file_id, object_key))
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn exists(&self, owner_id: UserId, order_id: OrderId) -> Result<(), AppError> {
        if self
            .orders
            .read_async(&owner_id, |_, draft| draft.id)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?
            == order_id
        {
            Ok(())
        } else {
            Err(AppError::NotFound(NotFoundError::ResourceNotFound))
        }
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn get_order(
        &self,
        owner_id: UserId,
    ) -> Result<OccupiedEntry<UserId, DraftOrder>, AppError> {
        self.orders
            .get_async(&owner_id)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn get_created_at(&self, owner_id: UserId) -> Result<DateTime<Utc>, AppError> {
        self.orders
            .read_async(&owner_id, |_, draft| draft.created_at)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn remove_file(&self, owner_id: UserId, file_id: FileId) -> Result<(), AppError> {
        let mut draft = self
            .orders
            .get_async(&owner_id)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        draft.remove_file(file_id);

        Ok(())
    }

    pub async fn delete(&self, owner_id: UserId) -> bool {
        self.orders.remove_async(&owner_id).await.is_some()
    }

    #[allow(clippy::cast_possible_wrap)]
    #[tracing::instrument(skip_all, err)]
    pub async fn build(
        &self,
        bucket: &R2Bucket,
        owner_id: UserId,
        OrderCreate {
            notes,
            files,
            services,
        }: OrderCreate,
    ) -> Result<DetailedOrder, AppError> {
        let mut draft_order = self
            .orders
            .get_async(&owner_id)
            .await
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        if draft_order.files_len() == 0 {
            return Err(AppError::BadRequest(
                "[4008] There are no files present in this order.".into(),
            ));
        }

        if !files.iter().all(|file| {
            draft_order.contains_file(file.id)
                && !file.ranges.is_empty()
                && file.ranges.len() <= MAX_FILE_RANGES
        }) || !services.iter().all(|service| {
            service
                .file_ids
                .iter()
                .all(|file_id| draft_order.contains_file(*file_id))
        }) {
            return Err(AppError::BadRequest(
                "[4008] Malformed or missing files and/or services were provided.".into(),
            ));
        }

        if stream::iter(draft_order.files.iter().map(Ok))
            .try_for_each_concurrent(MAX_FILE_LIMIT, |draft_file| {
                bucket.exists(&draft_file.object_key, draft_file.filetype)
            })
            .await
            .is_err()
        {
            return Err(AppError::BadRequest(
                "[4008] Object(s) bound to the order were not provided.".into(),
            ));
        }

        let files = files
            .into_iter()
            .map(|file| {
                draft_order.files.reverse();
                let DraftFile {
                    filetype,
                    filesize,
                    object_key,
                    ..
                } = draft_order
                    .files
                    .pop_if(|draft_file| draft_file.id == file.id)
                    .unwrap(); // Infallible

                File {
                    id: file.id,
                    filename: file.filename,
                    filetype,
                    filesize: filesize as i64,
                    object_key,
                    ranges: file
                        .ranges
                        .into_iter()
                        .map(|file_range| FileRange {
                            id: Uuid::new_v4().into(),
                            range: file_range.range,
                            copies: file_range.copies,
                            paper_variant_id: Some(file_range.paper_variant_id),
                            paper_orientation: file_range.paper_orientation,
                            is_colour: file_range.is_colour,
                            is_double_sided: file_range.is_double_sided,
                        })
                        .collect(),
                }
            })
            .collect();

        let order = DetailedOrder {
            id: draft_order.id,
            created_at: draft_order.created_at,
            owner_id: Some(owner_id),
            owner: None,
            order_number: Self::convert_queue_seq_to_order_number(self.next_queue()),
            status: OrderStatus::Reviewing,
            price: None,
            notes,
            status_history: Vec::with_capacity(0),
            files,
            services,
        };
        let _ = draft_order.remove_entry();

        Ok(order)
    }

    pub(crate) async fn clear_expired(&self, bucket: &R2Bucket) {
        let now = Utc::now();
        let mut expired_files = Vec::new();
        self.orders
            .retain_async(|_, draft| {
                if (now - draft.created_at).num_minutes() <= 15 {
                    true
                } else {
                    tracing::warn!("clearing draft order `{:?}`", draft.id);
                    draft.files.iter().for_each(|draft_file| {
                        expired_files.push((draft_file.object_key.clone(), draft_file.filetype));
                    });

                    false
                }
            })
            .await;

        if !expired_files.is_empty() {
            bucket.delete_files(&expired_files).await.ok();
        }
    }

    #[must_use]
    fn next_queue(&self) -> u16 {
        let current = self.queue.load(Ordering::Acquire);

        // NOTE: Order wraparound should theoretically not occur (there is no way the printer shop
        //       gets `MAX_QUEUE_SEQ` orders in a single day...). That would be insane, but it is a
        //       good safeguard.
        let next = if current == MAX_QUEUE_SEQ {
            1
        } else {
            current + 1
        };
        self.queue.store(next, Ordering::Release);

        next
    }

    pub fn load_queue_from_db(&self, queue: u16) {
        self.queue.store(queue - 1, Ordering::SeqCst);
    }

    pub fn reset_queue(&self) {
        self.queue.store(0, Ordering::Release);
    }

    #[must_use]
    #[allow(clippy::cast_possible_truncation)]
    fn convert_queue_seq_to_order_number(queue_seq: u16) -> String {
        let queue_seq = queue_seq - 1;
        let alphabet = ((queue_seq / 999) as u8 + b'A') as char;
        let number = (queue_seq % 999) + 1;

        format!("{alphabet}-{number:03}")
    }
}
