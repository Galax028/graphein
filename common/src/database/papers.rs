use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{
        Paper, PaperCreate, PaperId, PaperUpdate, PaperVariant, PaperVariantCreate, PaperVariantId,
    },
};

pub struct PapersTable;

impl PapersTable {
    #[tracing::instrument(skip_all, err)]
    pub async fn create_new(
        conn: &mut PgConnection,
        paper: &PaperCreate,
    ) -> SqlxResult<(PaperId, Vec<PaperVariant>)> {
        let paper_id = sqlx::query_scalar::<_, i32>(
            "\
            INSERT INTO papers (name, length, width, is_default)\
            VALUES ($1, $2, $3, $4) RETURNING id\
            ",
        )
        .bind(paper.name.as_str())
        .bind(paper.length)
        .bind(paper.width)
        .bind(paper.is_default)
        .fetch_one(&mut *conn)
        .await?
        .into();

        let variants_len = paper.variants.len();
        let mut variant_names = Vec::with_capacity(variants_len);
        let mut is_default_vec = Vec::with_capacity(variants_len);
        let mut is_available_vec = Vec::with_capacity(variants_len);
        let mut is_laminatable_vec = Vec::with_capacity(variants_len);
        paper.variants.iter().for_each(|paper_variant| {
            variant_names.push(paper_variant.name.as_str());
            is_default_vec.push(paper_variant.is_default);
            is_available_vec.push(paper_variant.is_available);
            is_laminatable_vec.push(paper_variant.is_laminatable);
        });

        let paper_variants = sqlx::query_as(
            "\
            INSERT INTO paper_variants (paper_id, name, is_default, is_available, is_laminatable)\
            SELECT $1, * FROM UNNEST($2::text[], $3::bool[], $4::bool[], $5::bool[])\
            RETURNING id, name, is_default, is_available, is_laminatable\
            ",
        )
        .bind(paper_id)
        .bind(&variant_names)
        .bind(&is_default_vec)
        .bind(&is_available_vec)
        .bind(&is_laminatable_vec)
        .fetch_all(conn)
        .await?;

        Ok((paper_id, paper_variants))
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn create_new_variant(
        conn: &mut PgConnection,
        paper_id: PaperId,
        paper_variant: &PaperVariantCreate,
    ) -> SqlxResult<PaperVariantId> {
        sqlx::query_scalar(
            "\
            INSERT INTO paper_variants (paper_id, name, is_default, is_available, is_laminatable)\
            VALUES ($1, $2, $3, $4, $5) RETURNING id\
            ",
        )
        .bind(paper_id)
        .bind(paper_variant.name.as_str())
        .bind(paper_variant.is_default)
        .bind(paper_variant.is_available)
        .bind(paper_variant.is_laminatable)
        .fetch_one(conn)
        .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn fetch_all(conn: &mut PgConnection) -> SqlxResult<Vec<Paper>> {
        sqlx::query_as(
            "\
            SELECT p.id, p.name, p.length, p.width, p.is_default, v.variants
            FROM papers AS p \
                JOIN LATERAL (SELECT \
                    ARRAY_AGG(ROW(\
                        id, name, is_default, is_available, is_laminatable\
                    )::paper_variant ORDER BY is_default DESC, name) AS variants \
                FROM paper_variants \
                WHERE paper_id = p.id) AS v ON true \
            ORDER BY p.is_default DESC, p.name\
            ",
        )
        .fetch_all(conn)
        .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn variants_len(conn: &mut PgConnection, paper_id: PaperId) -> SqlxResult<i64> {
        sqlx::query_scalar("SELECT COUNT(id) FROM paper_variants WHERE paper_id = $1")
            .bind(paper_id)
            .fetch_one(conn)
            .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn is_default(conn: &mut PgConnection, paper_id: PaperId) -> SqlxResult<bool> {
        sqlx::query_scalar("SELECT is_default FROM papers WHERE id = $1")
            .bind(paper_id)
            .fetch_one(conn)
            .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn is_default_variant(
        conn: &mut PgConnection,
        paper_id: PaperId,
        paper_variant_id: PaperVariantId,
    ) -> SqlxResult<bool> {
        sqlx::query_scalar("SELECT is_default FROM paper_variants WHERE id = $1 AND paper_id = $2")
            .bind(paper_variant_id)
            .bind(paper_id)
            .fetch_one(conn)
            .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn unset_default_paper(conn: &mut PgConnection) -> SqlxResult<()> {
        sqlx::query("UPDATE papers SET is_default = false WHERE is_default = true")
            .execute(conn)
            .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn unset_default_variant(
        conn: &mut PgConnection,
        paper_id: PaperId,
    ) -> SqlxResult<()> {
        sqlx::query(
            "\
            UPDATE paper_variants \
            SET is_default = false WHERE is_default = true AND paper_id = $1\
            ",
        )
        .bind(paper_id)
        .execute(conn)
        .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn update(
        conn: &mut PgConnection,
        paper_id: PaperId,
        paper: &PaperUpdate,
    ) -> SqlxResult<()> {
        sqlx::query(
            "UPDATE papers SET name = $2, length = $3, width = $4, is_default = $5 WHERE id = $1",
        )
        .bind(paper_id)
        .bind(paper.name.as_str())
        .bind(paper.length)
        .bind(paper.width)
        .bind(paper.is_default)
        .execute(conn)
        .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn update_variant(
        conn: &mut PgConnection,
        paper_id: PaperId,
        paper_variant_id: PaperVariantId,
        paper_variant: &PaperVariantCreate,
    ) -> SqlxResult<()> {
        sqlx::query(
            "\
            UPDATE paper_variants \
            SET name = $3, is_default = $4, is_available = $5, is_laminatable = $6 \
            WHERE id = $1 AND paper_id = $2",
        )
        .bind(paper_variant_id)
        .bind(paper_id)
        .bind(paper_variant.name.as_str())
        .bind(paper_variant.is_default)
        .bind(paper_variant.is_available)
        .bind(paper_variant.is_laminatable)
        .execute(conn)
        .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn delete(conn: &mut PgConnection, paper_id: PaperId) -> SqlxResult<()> {
        sqlx::query("DELETE FROM papers WHERE id = $1")
            .bind(paper_id)
            .execute(conn)
            .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn delete_variant(
        conn: &mut PgConnection,
        paper_id: PaperId,
        paper_variant_id: PaperVariantId,
    ) -> SqlxResult<()> {
        sqlx::query("DELETE FROM paper_variants WHERE id = $1 AND paper_id = $2")
            .bind(paper_variant_id)
            .bind(paper_id)
            .execute(conn)
            .await?;

        Ok(())
    }
}
