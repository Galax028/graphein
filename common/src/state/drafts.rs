use std::sync::{
    Arc,
    atomic::{AtomicU16, Ordering},
};

use chrono::{DateTime, Utc};
use dashmap::DashMap;
use uuid::Uuid;

use crate::{
    AppError,
    error::NotFoundError,
    schemas::{DetailedOrder, OrderCreate, OrderId, OrderStatusUpdate, UserId, enums::OrderStatus},
};

static MAX_QUEUE_SEQ: u16 = 25974; /* 26 * 999 */

#[derive(Clone, Debug)]
pub struct DraftOrderStore {
    orders: Arc<DashMap<UserId, (OrderId, DateTime<Utc>)>>,
    queue: Arc<AtomicU16>,
}

impl DraftOrderStore {
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
        self.orders.insert(owner_id, (order_id, Utc::now()));

        Ok(order_id)
    }

    pub fn build(
        &self,
        owner_id: UserId,
        OrderCreate {
            notes,
            files,
            services,
        }: OrderCreate,
    ) -> Result<DetailedOrder, AppError> {
        let (order_id, created_at) = self
            .orders
            .remove(&owner_id)
            .ok_or(AppError::NotFound(NotFoundError::ResourceNotFound))?
            .1;

        Ok(DetailedOrder {
            id: order_id,
            created_at,
            owner_id: Some(owner_id),
            order_number: Self::convert_queue_seq_to_order_number(self.next_queue()),
            status: OrderStatus::Reviewing,
            price: None,
            notes,
            status_history: vec![OrderStatusUpdate {
                timestamp: Utc::now(),
                status: OrderStatus::Reviewing,
            }],
            files,
            services,
        })
    }

    pub(crate) fn clear_expired(&self) {
        let now = Utc::now();
        self.orders
            .retain(|_, (_, created_at)| (now - *created_at).num_minutes() <= 15);
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
