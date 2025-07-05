FROM lukemathwalker/cargo-chef:latest-rust-1.86.0-slim-bookworm AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN apt-get update && apt-get install -y pkg-config libssl-dev libvips-dev
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin graphein-app

# We have no choice but to use Debian Sid due to `libvips` being outdated in Debian Bookworm
FROM debian:sid-slim AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y libvips \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/graphein-app /usr/local/bin
ENTRYPOINT ["/usr/local/bin/graphein-app"]
