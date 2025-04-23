use anyhow::anyhow;
use serde::Serialize;
use sqlx::PgConnection;

use crate::{FetchLevel, IdOnly, SqlxResult, database::Table, error::AppError};

#[derive(Debug, Serialize)]
#[serde(untagged)]
pub enum Model<T, Co, De>
where
    T: Table,
    Co: ModelVariant<T>,
    De: ModelVariant<T>,
{
    #[serde(skip)]
    Raw(T),

    IdOnly(Box<IdOnly<T::PK>>),
    Compact(Box<Co>),
    Default(Box<De>),
}

impl<T, Co, De> Model<T, Co, De>
where
    T: Table,
    Co: ModelVariant<T>,
    De: ModelVariant<T>,
{
    pub async fn into_model_variant(
        self,
        conn: &mut PgConnection,
        fetch_level: FetchLevel,
        descendant_fetch_level: FetchLevel,
    ) -> Result<Self, AppError> {
        match self {
            Model::Raw(model) => match fetch_level {
                FetchLevel::IdOnly => Ok(Self::IdOnly(Box::new(IdOnly { id: model.id() }))),

                FetchLevel::Compact => Ok(Self::Compact(Box::new(
                    Co::from_model(conn, model, descendant_fetch_level).await?,
                ))),

                FetchLevel::Default => Ok(Self::Default(Box::new(
                    De::from_model(conn, model, descendant_fetch_level).await?,
                ))),
            },
            _ => Err(AppError::InternalServerError {
                message: anyhow!("tried to use `into_model_variant` on a variant"),
            }),
        }
    }

    pub async fn fetch_one(conn: &mut PgConnection, id: T::PK) -> SqlxResult<Self> {
        Ok(Self::Raw(T::fetch_one(conn, id).await?))
    }

    pub async fn fetch_all(conn: &mut PgConnection, ids: Vec<T::PK>) -> SqlxResult<Vec<Self>> {
        Ok(T::fetch_all(conn, ids)
            .await?
            .into_iter()
            .map(Self::Raw)
            .collect())
    }
}

pub trait ModelVariant<T>
where
    Self: Serialize + Sized,
{
    async fn from_model(
        conn: &mut PgConnection,
        row: T,
        descendant_fetch_level: FetchLevel,
    ) -> Result<Self, AppError>;
}
