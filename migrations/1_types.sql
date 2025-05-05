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
    'bookbinding',
    'bookbinding_with_cover',
    'laminate'
);

CREATE TYPE user_role AS ENUM (
    'student',
    'teacher',
    'merchant'
);
