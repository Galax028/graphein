#![forbid(unsafe_code)]
#![warn(clippy::pedantic)]

use anyhow::Result as AnyhowResult;
use clap::Parser as _;
use graphein_scripts::{Cli, run_command};

#[tokio::main]
async fn main() -> AnyhowResult<()> {
    dotenvy::dotenv().ok();
    let cli = Cli::parse();

    run_command(cli).await
}
