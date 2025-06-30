import random

import asyncpg


async def command(database_url: str, merchant_email: str, merchant_name: str):
    conn = await asyncpg.connect(database_url)
    tx = conn.transaction()
    await tx.start()

    bookbinding_types_count = random.randint(5, 10)
    await conn.executemany(
        """\
        INSERT INTO bookbinding_types (id, name, is_available)\
        VALUES ($1)
        """,
        [
            (
                i,
                "Random Bookbinding " + str(random.randint(10, 99)),
                bool(random.randint(0, 1)),
            )
            for i in range(1, bookbinding_types_count + 1)
        ],
    )
    await conn.executemany(
        """\
        INSERT INTO bookbinding_types_paper_sizes (\
            bookbinding_type_id, paper_size_id, coverable\
        ) VALUES ($1, default_paper_size(), $2)\
        """,
        [(i, True) for i in range(1, bookbinding_types_count + 1)],
    )

    await conn.execute(
        """\
        INSERT INTO users (email, name, is_onboarded, profile_url, role)\
        VALUES ($1, $2, $3, $4, 'merchant')\
        """,
        merchant_email,
        merchant_name,
        True,
        "https://www.example.com",
    )

    await tx.commit()
    print("success")
