use futures::stream::BoxStream;
use sqlx::PgConnection;

use crate::{
    SqlxResult,
    schemas::{FileId, FileMetadata, OrderId},
};

pub struct FilesTable;

impl FilesTable {
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
}
