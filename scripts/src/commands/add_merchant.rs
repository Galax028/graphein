use anyhow::{Context as _, Result as AnyhowResult};
use clap_derive::Args;

use crate::connect_to_db;

#[derive(Debug, Args)]
pub(super) struct Args {
    /// The name of the merchant account
    #[arg(short = 'n', long)]
    merchant_name: String,

    /// The email of the merchant account
    #[arg(short = 'e', long)]
    merchant_email: String,
}

pub(super) async fn run(database_url: String, args: Args) -> AnyhowResult<()> {
    let pool = connect_to_db(database_url).await?;
    let mut tx = pool.begin().await?;

    let merchant_id = sqlx::query_scalar!(
        "\
        INSERT INTO users (email, name, is_onboarded, profile_url, role)\
        VALUES ($1, $2, $3, $4, 'merchant') RETURNING id\
        ",
        args.merchant_email,
        args.merchant_name,
        true,
        "<empty-by-design>",
    )
    .fetch_one(&mut *tx)
    .await
    .context("Failed while trying to create a merchant account")?;
    println!("Created a merchant user with ID `{merchant_id}`");

    Ok(tx.commit().await?)
}
