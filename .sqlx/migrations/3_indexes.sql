CREATE UNIQUE INDEX IF NOT EXISTS users_pkey_idx ON users USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_pkey_idx ON sessions USING btree (id);

CREATE INDEX IF NOT EXISTS sessions_user_id_fkey_idx ON sessions USING btree (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS bindings_pkey_idx ON bindings USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS binding_colours_pkey_idx ON binding_colours USING btree (id);

CREATE INDEX IF NOT EXISTS binding_colours_binding_id_fkey_idx
ON binding_colours USING btree (binding_id);

CREATE UNIQUE INDEX IF NOT EXISTS papers_pkey_idx ON papers USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS paper_variants_pkey_idx ON paper_variants USING btree (id);

CREATE INDEX IF NOT EXISTS paper_variants_paper_id_fkey_idx
ON paper_variants USING btree (paper_id);

CREATE UNIQUE INDEX IF NOT EXISTS bindings_papers_pkey_idx
ON bindings_papers USING btree (binding_id, paper_id);

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

CREATE UNIQUE INDEX IF NOT EXISTS file_ranges_pkey_idx ON file_ranges USING btree (id);

CREATE INDEX IF NOT EXISTS file_ranges_file_id_fkey_idx ON file_ranges USING btree (file_id);

CREATE INDEX IF NOT EXISTS file_ranges_paper_variant_id_fkey_idx
ON file_ranges USING btree (paper_variant_id);

CREATE UNIQUE INDEX IF NOT EXISTS services_pkey_idx ON services USING btree (id);

CREATE INDEX IF NOT EXISTS services_binding_colour_id_fkey_idx
ON services USING btree (binding_colour_id);

CREATE INDEX IF NOT EXISTS services_order_id_fkey_idx ON services USING btree (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS services_files_pkey_idx
ON services_files USING btree (order_id, service_id, file_id);
