CREATE UNIQUE INDEX IF NOT EXISTS users_pkey_idx ON users USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_pkey_idx ON sessions USING btree (id);

CREATE INDEX IF NOT EXISTS sessions_user_id_fkey_idx ON sessions USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS bookbinding_types_pkey_idx ON bookbinding_types USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS paper_sizes_pkey_idx ON paper_sizes USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS bookbinding_types_paper_sizes_pkey_idx
ON bookbinding_types_paper_sizes USING btree (bookbinding_type_id, paper_size_id);

CREATE UNIQUE INDEX IF NOT EXISTS orders_pkey_idx ON orders USING btree (id);

CREATE INDEX IF NOT EXISTS orders_owner_id_fkey_idx ON orders USING btree (owner_id);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders USING btree (status);

CREATE UNIQUE INDEX IF NOT EXISTS orders_created_at_id_idx
ON orders USING btree (created_at DESC, id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS order_status_updates_pkey_idx
ON order_status_updates USING btree (id);

CREATE INDEX IF NOT EXISTS order_status_updates_order_id_fkey_idx
ON order_status_updates USING btree (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS files_pkey_idx ON files USING btree (id);

CREATE INDEX IF NOT EXISTS files_order_id_fkey_idx ON files USING btree (order_id);

CREATE INDEX IF NOT EXISTS files_paper_size_id_fkey_idx ON files USING btree (paper_size_id);

CREATE UNIQUE INDEX IF NOT EXISTS services_pkey_idx ON services USING btree (id);

CREATE INDEX IF NOT EXISTS services_bookbinding_type_id_fkey_idx
ON services USING btree (bookbinding_type_id);

CREATE INDEX IF NOT EXISTS services_order_id_fkey_idx ON services USING btree (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS services_files_pkey_idx
ON services_files USING btree (order_id, service_id, file_id);
