#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(clippy::missing_errors_doc)]

pub(crate) mod routes;

#[doc(hidden)]
pub use crate::routes::expand_router;
