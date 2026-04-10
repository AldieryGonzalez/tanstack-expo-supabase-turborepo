#!/bin/sh

set -eu

if [ -n "${DATABASE_URL:-}" ]; then
	exit 0
fi

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$SCRIPT_DIR/../docker-compose.yml"

if ! command -v docker >/dev/null 2>&1; then
	echo "DATABASE_URL is not set, so a local Docker-backed Postgres instance is required." >&2
	echo "Install Docker or set DATABASE_URL to a reachable Postgres instance." >&2
	exit 1
fi

if ! docker info >/dev/null 2>&1; then
	echo "DATABASE_URL is not set, and Docker is not running." >&2
	echo "Start Docker Desktop or another Docker engine, then rerun the command." >&2
	exit 1
fi

docker compose -f "$COMPOSE_FILE" up --wait --detach postgres >/dev/null
