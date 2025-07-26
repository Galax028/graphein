use anyhow::Result as AnyhowResult;
use clap_derive::Subcommand;

use crate::Cli;

mod populate_db;

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Populates the database before first use
    PopulateDb(populate_db::Args),
}

pub async fn run_command(cli: Cli) -> AnyhowResult<()> {
    match cli.command {
        Command::PopulateDb(args) => populate_db::run(cli.database_url, args).await,
    }
}
