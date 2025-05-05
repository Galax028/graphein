CREATE TABLE settings (
    created_at                timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_accepting              boolean     NOT NULL,
    is_lamination_serviceable boolean     NOT NULL,
    open_time                 time        NOT NULL,
    close_time                time        NOT NULL
);

CREATE TABLE users (
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

CREATE TABLE sessions (
    id         text        NOT NULL,
    user_id    uuid        NOT NULL,
    issued_at  timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE bookbinding_types (
    id           integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name         text        NOT NULL,
    is_available boolean     NOT NULL DEFAULT true,
    PRIMARY KEY (id),
    UNIQUE (name)
);

CREATE TABLE paper_sizes (
    id              integer     NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at      timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name            text        NOT NULL,
    length          integer     NOT NULL,
    width           integer     NOT NULL,
    is_default      boolean     NOT NULL DEFAULT false,
    is_available    boolean     NOT NULL DEFAULT true,
    is_laminatable  boolean     NOT NULL DEFAULT false,
    PRIMARY KEY (id),
    UNIQUE (name)
);

INSERT INTO paper_sizes (name, length, width, is_default, is_laminatable)
VALUES ('A4 (80 gsm)', 297, 210, true, true);

CREATE FUNCTION default_paper_size() RETURNS integer LANGUAGE 'sql' COST 100 AS $$
    SELECT id FROM paper_sizes WHERE is_default = true LIMIT 1;
$$;

CREATE TABLE bookbinding_types_paper_sizes (
    bookbinding_type_id integer NOT NULL,
    paper_size_id       integer NOT NULL,
    coverable           boolean NOT NULL DEFAULT false,
    PRIMARY KEY (bookbinding_type_id, paper_size_id),
    FOREIGN KEY (bookbinding_type_id) REFERENCES bookbinding_types (id)
        ON DELETE CASCADE,
    FOREIGN KEY (paper_size_id) REFERENCES paper_sizes (id)
        ON DELETE CASCADE
);

CREATE TABLE orders (
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

CREATE TABLE order_status_updates (
    id         bigint       NOT NULL GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id   uuid         NOT NULL,
    status     order_status NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE
);

CREATE TABLE files (
    id                uuid              NOT NULL DEFAULT gen_random_uuid(),
    created_at        timestamptz       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id          uuid              NOT NULL,
    object_id         text              NOT NULL,
    filename          text              NOT NULL,
    filetype          filetype          NOT NULL,
    filesize          bigint            NOT NULL,
    copies            integer           NOT NULL DEFAULT 1,
    range             text,
    scaling           integer           NOT NULL DEFAULT 100,
    paper_size_id     integer           NOT NULL DEFAULT default_paper_size(),
    paper_orientation paper_orientation NOT NULL DEFAULT 'portrait',
    is_double_sided   boolean           NOT NULL DEFAULT false,
    is_colour         boolean           NOT NULL DEFAULT false,
    index             integer           NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    FOREIGN KEY (paper_size_id) REFERENCES paper_sizes (id)
        ON DELETE SET NULL,
    UNIQUE (object_id),
    UNIQUE (order_id, index)
);

CREATE TABLE services (
    id                  uuid         NOT NULL DEFAULT gen_random_uuid(),
    created_at          timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id            uuid         NOT NULL,
    service_type        service_type NOT NULL,
    bookbinding_type_id integer,
    notes               text,
    index integer NOT NULL,
    CONSTRAINT services_pkey PRIMARY KEY (id),
    CONSTRAINT services_order_id_service_type_key UNIQUE (order_id, service_type),
    FOREIGN KEY (bookbinding_type_id) REFERENCES bookbinding_types (id)
        ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    UNIQUE (order_id, index)
);

CREATE TABLE services_files (
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
