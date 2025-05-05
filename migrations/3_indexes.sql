CREATE UNIQUE INDEX users_pkey_idx ON users USING btree (id);

CREATE UNIQUE INDEX sessions_pkey_idx ON sessions USING btree (id);

CREATE INDEX sessions_user_id_fkey_idx ON sessions USING btree (user_id);

CREATE UNIQUE INDEX bookbinding_types_pkey_idx ON bookbinding_types USING btree (id);

CREATE UNIQUE INDEX paper_sizes_pkey_idx ON paper_sizes USING btree (id);

CREATE UNIQUE INDEX bookbinding_types_paper_sizes_pkey_idx
ON bookbinding_types_paper_sizes USING btree (bookbinding_type_id, paper_size_id);

CREATE UNIQUE INDEX orders_pkey_idx ON orders USING btree (id);

CREATE INDEX orders_owner_id_fkey_idx ON orders USING btree (owner_id);

CREATE INDEX orders_status_idx ON orders USING btree (status);

CREATE UNIQUE INDEX orders_created_at_id_idx ON orders USING btree (created_at DESC, id DESC);

CREATE UNIQUE INDEX order_status_updates_pkey_idx ON order_status_updates USING btree (id);

CREATE UNIQUE INDEX order_status_updates_order_id_fkey_idx
ON order_status_updates USING btree (order_id);

CREATE UNIQUE INDEX files_pkey_idx ON files USING btree (id);

CREATE INDEX files_order_id_fkey_idx ON files USING btree (order_id);

CREATE INDEX files_paper_size_id_fkey_idx ON files USING btree (paper_size_id);

CREATE UNIQUE INDEX services_pkey_idx ON services USING btree (id);

CREATE INDEX services_bookbinding_type_id_fkey_idx ON services USING btree (bookbinding_type_id);

CREATE INDEX services_order_id_fkey_idx ON services USING btree (order_id);

CREATE UNIQUE INDEX services_files_pkey_idx
ON services_files USING btree (order_id, service_id, file_id);
