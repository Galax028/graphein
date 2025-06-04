import os
import random
from datetime import timedelta
from typing import Optional

import asyncpg
from asyncpg import Record


async def command(database_url: str, email: str, order_number: str):
    conn = await asyncpg.connect(database_url)
    tx = conn.transaction()
    await tx.start()

    owner_id = await conn.fetchval("SELECT id FROM users WHERE email = $1", email)
    if not owner_id:
        raise Exception("Given email does map to an existing user in the database.")

    order = await conn.fetchrow(
        """\
        INSERT INTO orders (owner_id, order_number, status, price)\
        VALUES ($1, $2, 'completed', $3) \
        RETURNING id, created_at\
        """,
        owner_id,
        order_number,
        random.randint(5, 80),
    )
    assert isinstance(order, Record)
    (order_id, order_created_at) = (order["id"], order["created_at"])

    await conn.executemany(
        """\
        INSERT INTO order_status_updates (created_at, order_id, status) \
        VALUES ($1, $2, $3)\
        """,
        [
            (order_created_at, order_id, "reviewing"),
            (
                order_created_at + timedelta(minutes=random.randint(1, 3)),
                order_id,
                "processing",
            ),
            (
                order_created_at + timedelta(minutes=random.randint(4, 7)),
                order_id,
                "ready",
            ),
            (
                order_created_at + timedelta(minutes=random.randint(8, 15)),
                order_id,
                "completed",
            ),
        ],
    )

    files = await conn.fetchmany(
        """\
        INSERT INTO files (\
            created_at, order_id, is_colour, object_id, filename, filetype, filesize,\
            index\
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\
        RETURNING id\
        """,
        [
            (
                order_created_at,
                order_id,
                bool(random.randint(0, 1)),
                os.urandom(16).hex(),
                "random-file-name" + str(random.randint(1000, 9999)),
                random.choice(("pdf", "png", "jpg")),
                random.randint(1000, 50 * 1_000_000),
                index,
            )
            for index in range(random.randint(3, 6))
        ],
    )

    if random.randint(0, 1):
        services = await conn.fetchmany(
            """\
            INSERT INTO services (\
                created_at, order_id, service_type, bookbinding_type_id, index\
            ) VALUES ($1, $2, $3, $4, $5)\
            RETURNING id, service_type\
            """,
            [
                (
                    order_created_at,
                    order_id,
                    random.choice(("bookbinding", "bookbinding_with_cover"))
                    if index == 0
                    else "laminate",
                    random.randint(1, 5) if index == 0 else None,
                    index,
                )
                for index in range(random.randint(1, 2))
            ],
        )

        await conn.executemany(
            """\
            INSERT INTO services_files (order_id, service_id, file_id)\
            VALUES ($1, $2, $3)\
            """,
            [
                (order_id, service["id"], file["id"])
                for file in files
                for service in services
                if service["service_type"].startswith("bookbinding")
                or random.randint(0, 1)
            ],
        )

    await tx.commit()
    print("created")
