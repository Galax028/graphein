#!/usr/bin/env -S uv run
import asyncio
import os

from dotenv import load_dotenv
from typer import Argument, Typer
from typing_extensions import Annotated

DATABASE_URL: str = ""

commands = Typer(pretty_exceptions_show_locals=False)


@commands.command("reserved", help="Reserved command.")
def command_reserved():
    pass


@commands.command("create-order", help="Creates a single order.")
def command_create_order(
    email: Annotated[str, Argument(help="The email of the user.")],
    order_number: Annotated[str, Argument(help="The order number sequence.")],
):
    from create_order import command

    global DATABASE_URL

    asyncio.run(command(DATABASE_URL, email, order_number))


if __name__ == "__main__":
    load_dotenv()
    DATABASE_URL = os.environ.get("DATABASE_URL", default="")
    if DATABASE_URL == "":
        raise Exception("The `DATABASE_URL` environment variable is missing.")

    commands()
