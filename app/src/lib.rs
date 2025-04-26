#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(clippy::missing_errors_doc)]

//! This is the public-facing documentation for Graphein, the server powering SK Printing Facility.
//!
//! # How to read this documentation
//!
//! The current [crate] (`graphein_app`) contains the formal definitions of all the routes along
//! with their required parameters, data, requests, and responses. The schemas of data transfer
//! objects and entities will be located in the [common](graphein_common) (`graphein_common`) crate.

pub mod docs;

pub(crate) mod routes;

#[doc(hidden)]
pub use crate::routes::expand_router;
