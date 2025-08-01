CREATE TYPE filetype AS ENUM (
    'pdf',
    'png',
    'jpg'
);

CREATE TYPE order_status AS ENUM (
    'building',
    'reviewing',
    'processing',
    'ready',
    'completed',
    'rejected',
    'cancelled'
);

CREATE TYPE paper_orientation AS ENUM (
    'portrait',
    'landscape'
);

CREATE TYPE service_type AS ENUM (
    'binding',
    'binding_with_cover',
    'laminate'
);

CREATE TYPE user_role AS ENUM (
    'student',
    'teacher',
    'merchant'
);

CREATE TYPE file_range AS (
    id                uuid,
    range             text,
    copies            integer,
    paper_variant_id  integer,
    paper_orientation paper_orientation,
    is_colour         boolean,
    is_double_sided   boolean
);

CREATE TYPE paper_variant AS (
    id             integer,
    name           text,
    is_default     boolean,
    is_available   boolean,
    is_laminatable boolean
);
