#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]
#![allow(private_interfaces, clippy::missing_errors_doc)]

pub mod commands;

pub use commands::run_command;

use anyhow::{Context as _, Result as AnyhowResult};
use clap_derive::Parser;
use sqlx::{PgPool, postgres::PgPoolOptions};

use crate::commands::Command;

#[derive(Debug, Parser)]
#[command(name = "graphein-scripts", version)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Command,

    /// The URL of the database to connect with
    #[arg(short = 'D', long, env = "DATABASE_URL", hide_env_values = true)]
    database_url: String,
}

pub(crate) async fn connect_to_db(database_url: String) -> AnyhowResult<PgPool> {
    PgPoolOptions::new()
        .connect_with(
            database_url
                .parse()
                .context("Invalid value for environment variable `DATABASE_URL`")?,
        )
        .await
        .context("Failed to establish a connection pool with the database")
}
