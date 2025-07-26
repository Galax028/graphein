use anyhow::Result as AnyhowResult;
use chrono::NaiveTime;
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

    /// The shop's opening time
    #[arg(short = 'o', long, default_value_t = NaiveTime::from_hms_opt(6, 0, 0).unwrap())]
    open_time: NaiveTime,

    /// The shop's closing time
    #[arg(short = 'c', long, default_value_t = NaiveTime::from_hms_opt(18, 0, 0).unwrap())]
    close_time: NaiveTime,
}

pub(super) async fn run(database_url: String, args: Args) -> AnyhowResult<()> {
    let pool = connect_to_db(database_url).await?;
    let mut tx = pool.begin().await?;

    sqlx::query!(
        "\
        INSERT INTO settings (is_accepting, is_lamination_serviceable, open_time, close_time)\
        VALUES ($1, $2, $3, $4)\
        ",
        true,
        false,
        args.open_time,
        args.close_time,
    )
    .execute(&mut *tx)
    .await?;
    println!("Created settings");

    let paper_id = sqlx::query_scalar!(
        "INSERT INTO papers (name, length, width, is_default) VALUES ($1, $2, $3, $4) RETURNING id",
        "A4",
        297,
        210,
        true,
    )
    .fetch_one(&mut *tx)
    .await?;
    sqlx::query!(
        "\
        INSERT INTO paper_variants (paper_id, name, is_default, is_laminatable)\
        VALUES ($1, $2, $3, $4)\
        ",
        paper_id,
        "Standard Copy Paper (80 gsm)",
        true,
        true,
    )
    .execute(&mut *tx)
    .await?;
    println!("Created a default paper size and variant");

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
    .await?;
    println!("Created a merchant user with ID `{merchant_id}`");

    Ok(tx.commit().await?)
}
