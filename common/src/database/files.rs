use chrono::{DateTime, FixedOffset};
use futures::stream::BoxStream;
use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{File, FileId, FileMetadata, OrderId, enums::FileType},
};

pub struct FilesTable;

impl FilesTable {
    #[allow(clippy::cast_possible_truncation, clippy::cast_possible_wrap)]
    #[tracing::instrument(skip_all, err)]
    pub async fn create_new(
        conn: &mut PgConnection,
        order_id: OrderId,
        file: &File,
        index: i32,
    ) -> SqlxResult<()> {
        sqlx::query(
            "\
                INSERT INTO files (id, order_id, object_key, filename, filetype, filesize, index)\
                VALUES ($1, $2, $3, $4, $5, $6, $7)\
                ",
        )
        .bind(file.id)
        .bind(order_id)
        .bind(file.object_key.as_str())
        .bind(file.filename.as_str())
        .bind(file.filetype)
        .bind(file.filesize)
        .bind(index)
        .execute(&mut *conn)
        .await?;

        let ranges_len = file.ranges.len();
        let mut ids = Vec::with_capacity(ranges_len);
        let mut ranges = Vec::with_capacity(ranges_len);
        let mut copies_vec = Vec::with_capacity(ranges_len);
        let mut paper_variant_ids = Vec::with_capacity(ranges_len);
        let mut paper_orientations = Vec::with_capacity(ranges_len);
        let mut is_double_sided_vec = Vec::with_capacity(ranges_len);
        let mut is_colour_vec = Vec::with_capacity(ranges_len);
        let mut indexes = Vec::with_capacity(ranges_len);
        file.ranges
            .iter()
            .enumerate()
            .for_each(|(index, file_range)| {
                ids.push(file_range.id);
                ranges.push(file_range.range.as_deref());
                copies_vec.push(file_range.copies);
                paper_variant_ids.push(file_range.paper_variant_id);
                paper_orientations.push(file_range.paper_orientation);
                is_double_sided_vec.push(file_range.is_double_sided);
                is_colour_vec.push(file_range.is_colour);
                indexes.push(index as i32);
            });

        sqlx::query(
            "\
            INSERT INTO file_ranges (\
                file_id, id, range, copies, paper_variant_id, paper_orientation,\
                is_double_sided, is_colour, index\
            ) SELECT $1, * FROM UNNEST(\
                $2::uuid[], $3::text[], $4::integer[], $5::integer[], $6::paper_orientation[],\
                $7::boolean[], $8::boolean[], $9::integer[]\
            )\
            ",
        )
        .bind(file.id)
        .bind(&ids)
        .bind(&ranges)
        .bind(&copies_vec)
        .bind(&paper_variant_ids)
        .bind(&paper_orientations)
        .bind(&is_double_sided_vec)
        .bind(&is_colour_vec)
        .bind(&indexes)
        .execute(&mut *conn)
        .await?;

        Ok(())
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn fetch_one_for_metadata_from_order(
        conn: &mut PgConnection,
        order_id: OrderId,
        file_id: FileId,
    ) -> SqlxResult<FileMetadata> {
        sqlx::query_as(
            "\
            SELECT f.id, f.object_key, f.filename, f.filetype \
            FROM files AS f \
                JOIN orders AS o ON o.id = f.order_id \
            WHERE f.id = $1 AND f.order_id = $2 \
                ORDER BY f.index\
            ",
        )
        .bind(file_id)
        .bind(order_id)
        .fetch_one(conn)
        .await
    }

    pub fn stream_all_for_metadata_from_order(
        conn: &mut PgConnection,
        order_id: OrderId,
    ) -> BoxStream<SqlxResult<FileMetadata>> {
        sqlx::query_as(
            "\
            SELECT f.id, f.object_key, f.filename, f.filetype \
            FROM files AS f \
                JOIN orders AS o ON o.id = f.order_id \
            WHERE f.order_id = $1 \
                ORDER BY f.index\
            ",
        )
        .bind(order_id)
        .fetch(conn)
    }

    #[tracing::instrument(skip_all, err)]
    pub(crate) async fn fetch_object_keys_for_deletion(
        conn: &mut PgConnection,
        timestamp: DateTime<FixedOffset>,
    ) -> SqlxResult<Vec<(String, FileType)>> {
        Ok(sqlx::query!(
            "\
            SELECT object_key, filetype as \"filetype: FileType\" \
            FROM files WHERE created_at < $1\
            ",
            timestamp,
        )
        .fetch_all(conn)
        .await?
        .into_iter()
        .map(|file| (file.object_key, file.filetype))
        .collect())
    }
}
