use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{Paper, PaperCreate, PaperId, PaperVariant},
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
}
