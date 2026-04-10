#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$SCRIPT_DIR/../docker-compose.yml"

if ! command -v docker >/dev/null 2>&1; then
	echo "Docker is required to run @monorepo/db dev." >&2
	exit 1
fi

if ! docker info >/dev/null 2>&1; then
	echo "Docker is installed, but the daemon is not running. Start Docker Desktop or another Docker engine, then rerun bun dev." >&2
	exit 1
fi

cleanup() {
	docker compose -f "$COMPOSE_FILE" down >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

docker compose -f "$COMPOSE_FILE" up --wait --detach postgres
docker compose -f "$COMPOSE_FILE" logs --follow postgres
