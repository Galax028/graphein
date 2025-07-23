CREATE TABLE IF NOT EXISTS settings (
    created_at                timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latest_orders_flushed_at  timestamptz,
    is_accepting              boolean     NOT NULL,
    is_lamination_serviceable boolean     NOT NULL,
    open_time                 time        NOT NULL,
    close_time                time        NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id           uuid        NOT NULL DEFAULT gen_random_uuid(),
    created_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email        text        NOT NULL,
    name         text        NOT NULL,
    tel          text,
    is_onboarded boolean     NOT NULL DEFAULT false,
    profile_url  text        NOT NULL,
    class        smallint,
    class_no     smallint,
    role         user_role   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS sessions (
    id         text        NOT NULL,
    user_id    uuid        NOT NULL,
    issued_at  timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bindings (
    id           integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name         text        NOT NULL,
    is_available boolean     NOT NULL DEFAULT true,
    PRIMARY KEY (id),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS binding_colours (
    id           integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    binding_id   integer     NOT NULL,
    colour       text        NOT NULL,
    is_available boolean     NOT NULL DEFAULT true,
    PRIMARY KEY (id),
    FOREIGN KEY (binding_id) REFERENCES bindings (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS papers (
    id         integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name       text        NOT NULL,
    length     integer     NOT NULL,
    width      integer     NOT NULL,
    is_default boolean     NOT NULL DEFAULT false,
    PRIMARY KEY (id),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS paper_variants (
    id             integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at     timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paper_id       integer     NOT NULL,
    name           text        NOT NULL,
    is_default     boolean     NOT NULL DEFAULT false,
    is_available   boolean     NOT NULL DEFAULT true,
    is_laminatable boolean     NOT NULL DEFAULT false,
    PRIMARY KEY (id),
    FOREIGN KEY (paper_id) REFERENCES papers (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bindings_papers (
    binding_id integer NOT NULL,
    paper_id   integer NOT NULL,
    coverable  boolean NOT NULL DEFAULT false,
    PRIMARY KEY (binding_id, paper_id),
    FOREIGN KEY (binding_id) REFERENCES bindings (id)
        ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES papers (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id           uuid         NOT NULL DEFAULT gen_random_uuid(),
    created_at   timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_id     uuid         NOT NULL,
    order_number text         NOT NULL,
    status       order_status NOT NULL DEFAULT 'building',
    price        bigint,
    notes        text,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_status_updates (
    id         bigint       NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id   uuid         NOT NULL,
    status     order_status NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
    id         uuid        NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id   uuid        NOT NULL,
    object_key text        NOT NULL,
    filename   text        NOT NULL,
    filetype   filetype    NOT NULL,
    filesize   bigint      NOT NULL,
    index      integer     NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    UNIQUE (object_key),
    UNIQUE (order_id, index)
);

CREATE TABLE IF NOT EXISTS file_ranges (
    id                uuid              NOT NULL DEFAULT gen_random_uuid(),
    created_at        timestamptz       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_id           uuid              NOT NULL,
    range             text,
    copies            integer           NOT NULL DEFAULT 1,
    paper_variant_id  integer,
    paper_orientation paper_orientation NOT NULL DEFAULT 'portrait',
    is_double_sided   boolean           NOT NULL DEFAULT false,
    is_colour         boolean           NOT NULL DEFAULT false,
    index             integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (file_id) REFERENCES files (id)
        ON DELETE CASCADE,
    FOREIGN KEY (paper_variant_id) REFERENCES paper_variants (id)
        ON DELETE SET NULL,
    UNIQUE (file_id, range),
    UNIQUE (file_id, index)
);

CREATE TABLE IF NOT EXISTS services (
    id                uuid         NOT NULL DEFAULT gen_random_uuid(),
    created_at        timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id          uuid         NOT NULL,
    type              service_type NOT NULL,
    binding_colour_id integer,
    notes             text,
    index             integer NOT NULL,
    CONSTRAINT services_pkey PRIMARY KEY (id),
    CONSTRAINT services_order_id_type_key UNIQUE (order_id, type),
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    FOREIGN KEY (binding_colour_id) REFERENCES binding_colours (id)
        ON DELETE SET NULL,
    UNIQUE (order_id, index)
);

CREATE TABLE IF NOT EXISTS services_files (
    order_id   uuid NOT NULL,
    service_id uuid NOT NULL,
    file_id    uuid NOT NULL,
    PRIMARY KEY (order_id, service_id, file_id),
    FOREIGN KEY (file_id) REFERENCES files (id)
        ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services (id)
        ON DELETE CASCADE
);
