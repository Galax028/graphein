#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(clippy::missing_errors_doc)]

pub use crate::routes::expand_router;

pub(crate) mod routes;
pub(crate) mod schemas;
