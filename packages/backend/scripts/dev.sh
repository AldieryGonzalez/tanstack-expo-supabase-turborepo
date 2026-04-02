#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${BACKEND_ENV_FILE:-$PACKAGE_DIR/.env.local}"

if [[ -f "$ENV_FILE" ]]; then
	# shellcheck disable=SC1090
	set -a
	source "$ENV_FILE"
	set +a
	echo "[backend] Loaded env from $ENV_FILE"
fi

AUTH_URL="${MONOREPO_AUTH_URL:-}"

if [[ -z "$AUTH_URL" && -n "${CLOUDFLARE_AUTH_HOST:-}" ]]; then
	if [[ "$CLOUDFLARE_AUTH_HOST" == http://* || "$CLOUDFLARE_AUTH_HOST" == https://* ]]; then
		AUTH_URL="$CLOUDFLARE_AUTH_HOST"
	else
		AUTH_URL="https://${CLOUDFLARE_AUTH_HOST}"
	fi
fi

if [[ -z "$AUTH_URL" && -n "${CONVEX_SITE_URL:-}" ]]; then
	AUTH_URL="$CONVEX_SITE_URL"
fi

if [[ -z "$AUTH_URL" ]]; then
	AUTH_URL="http://127.0.0.1:3211"
fi

echo "[backend] Syncing Convex SITE_URL=$AUTH_URL"
if ! npx convex env set SITE_URL "$AUTH_URL" >/dev/null; then
	echo "[backend] Warning: failed to update Convex SITE_URL. Continuing with existing value." >&2
fi

echo "[backend] Starting Convex dev"
exec env NODE_ENV=development convex dev
