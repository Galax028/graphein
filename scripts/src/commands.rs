use anyhow::Result as AnyhowResult;
use clap_derive::Subcommand;

use crate::Cli;

mod add_merchant;
mod populate_db;

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Adds a merchant account to the database
    AddMerchant(add_merchant::Args),

    /// Populates the database before first use
    PopulateDb(populate_db::Args),
}

pub async fn run_command(cli: Cli) -> AnyhowResult<()> {
    match cli.command {
        Command::AddMerchant(args) => add_merchant::run(cli.database_url, args).await,
        Command::PopulateDb(args) => populate_db::run(cli.database_url, args).await,
    }
}
