use std::sync::{
    Arc,
    atomic::{AtomicU16, Ordering},
};

use chrono::{DateTime, Utc};
use dashmap::DashMap;
use futures::stream::{self, TryStreamExt as _};
use rand::{RngCore as _, SeedableRng as _, rngs::StdRng};
use uuid::Uuid;

use crate::{
    AppError, MAX_FILE_LIMIT,
    error::NotFoundError,
    schemas::{
        DetailedOrder, File, FileId, OrderCreate, OrderId, UserId,
        enums::{FileType, OrderStatus},
    },
};

use super::R2Bucket;

const MAX_QUEUE_SEQ: u16 = 25974; /* 26 * 999 */

#[derive(Clone, Debug)]
pub struct DraftFile {
    id: FileId,
    pub filetype: FileType,
    pub filesize: u64,
    pub object_key: String,
}

#[derive(Debug)]
pub struct DraftOrder {
    id: OrderId,
    created_at: DateTime<Utc>,
    files: Vec<DraftFile>,
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
    orders: Arc<DashMap<UserId, DraftOrder>>,
    queue: Arc<AtomicU16>,
}

impl DraftOrderStore {
    #[must_use]
    pub(super) fn new() -> Self {
        Self {
            orders: Arc::new(DashMap::new()),
            queue: Arc::new(AtomicU16::new(1)),
        }
    }

    pub fn insert(&self, owner_id: UserId) -> Result<OrderId, AppError> {
        if self.orders.contains_key(&owner_id) {
            return Err(AppError::BadRequest(
                "An order in `Building` already exists.".into(),
            ));
        }

        let order_id = Uuid::new_v4().into();
        self.orders.insert(owner_id, DraftOrder::new(order_id));

        Ok(order_id)
    }

    pub fn add_file(
        &self,
        owner_id: UserId,
        filetype: FileType,
        filesize: u64,
    ) -> Result<(FileId, String), AppError> {
        let mut draft = self
            .orders
            .get_mut(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        if draft.files_len() == MAX_FILE_LIMIT {
            return Err(AppError::BadRequest(
                "This order has already reached the maximum file limit.".into(),
            ));
        }

        let file_id = Uuid::new_v4().into();
        let object_key = draft.add_file(file_id, filetype, filesize);

        Ok((file_id, object_key))
    }

    pub fn exists(&self, owner_id: UserId, order_id: OrderId) -> Result<(), AppError> {
        if self
            .orders
            .get(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?
            .id
            == order_id
        {
            Ok(())
        } else {
            Err(AppError::NotFound(NotFoundError::ResourceNotFound))
        }
    }

    pub fn get_file(&self, owner_id: UserId, file_id: FileId) -> Result<DraftFile, AppError> {
        let draft = self
            .orders
            .get(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        draft
            .files
            .iter()
            .find(|file| file.id == file_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))
            .cloned() // I tried
    }

    pub fn get_created_at(&self, owner_id: UserId) -> Result<DateTime<Utc>, AppError> {
        Ok(self
            .orders
            .get(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?
            .created_at)
    }

    pub fn remove_file(&self, owner_id: UserId, file_id: FileId) -> Result<(), AppError> {
        let mut draft = self
            .orders
            .get_mut(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?;

        draft.remove_file(file_id);

        Ok(())
    }

    #[allow(clippy::cast_possible_wrap)]
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
            .remove(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?
            .1;

        if draft_order.files_len() == 0 {
            return Err(AppError::BadRequest(
                "There are no files present in this order.".into(),
            ));
        }

        if !files.iter().all(|file| draft_order.contains_file(file.id))
            || !services.iter().all(|service| {
                service
                    .file_ids
                    .iter()
                    .all(|file_id| draft_order.contains_file(*file_id))
            })
        {
            return Err(AppError::BadRequest(
                "Malformed or missing files and/or services were provided.".into(),
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
                "Object(s) bound to the order were not provided.".into(),
            ));
        }

        let files = files
            .into_iter()
            .map(|file| {
                let draft_file = draft_order
                    .files
                    .pop_if(|draft_file| draft_file.id == file.id)
                    .unwrap();

                File {
                    id: file.id,
                    filename: file.filename,
                    filetype: draft_file.filetype,
                    filesize: draft_file.filesize as i64,
                    object_key: draft_file.object_key,
                    copies: file.copies,
                    range: file.range,
                    paper_size_id: Some(file.paper_size_id),
                    paper_orientation: file.paper_orientation,
                    is_colour: file.is_colour,
                    scaling: file.scaling,
                    is_double_sided: file.is_double_sided,
                }
            })
            .collect();

        Ok(DetailedOrder {
            id: draft_order.id,
            created_at: draft_order.created_at,
            owner_id: Some(owner_id),
            order_number: Self::convert_queue_seq_to_order_number(self.next_queue()),
            status: OrderStatus::Reviewing,
            price: None,
            notes,
            status_history: Vec::with_capacity(0),
            files,
            services,
        })
    }

    pub(crate) fn clear_expired(&self) {
        let now = Utc::now();
        self.orders
            .retain(|_, draft| (now - draft.created_at).num_minutes() <= 15);
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

    pub fn reset_queue(&self) {
        self.queue.store(1, Ordering::Release);
    }

    #[must_use]
    #[allow(clippy::cast_possible_truncation)]
    fn convert_queue_seq_to_order_number(queue_seq: u16) -> String {
        let (alphabet, number) = match queue_seq % 999 {
            0 => (((queue_seq / 999) - 1 + 65), 999),
            other => (((queue_seq / 999) + 65), other),
        };

        format!("{}-{:03}", alphabet as u8 as char, number)
    }
}
