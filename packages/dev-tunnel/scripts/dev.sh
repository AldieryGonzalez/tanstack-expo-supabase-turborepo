#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${CLOUDFLARE_ENV_FILE:-$PACKAGE_DIR/.env.local}"

if [[ -f "$ENV_FILE" ]]; then
	# shellcheck disable=SC1090
	set -a
	source "$ENV_FILE"
	set +a
	echo "[tunnel] Loaded env from $ENV_FILE"
fi

if [[ "${CLOUDFLARE_TUNNEL_ENABLED:-0}" != "1" ]]; then
	echo "[tunnel] Disabled (set CLOUDFLARE_TUNNEL_ENABLED=1 to enable in bun dev)."
	exec tail -f /dev/null
fi

TUNNEL_NAME="${CLOUDFLARE_TUNNEL_NAME:-monorepo-local}"
CONFIG_FILE="${CLOUDFLARE_TUNNEL_CONFIG:-$HOME/.cloudflared/config.yml}"
AUTH_HOST="${CLOUDFLARE_AUTH_HOST:-}"
API_HOST="${CLOUDFLARE_API_HOST:-}"
WEB_HOST="${CLOUDFLARE_WEB_HOST:-}"

if [[ -z "$AUTH_HOST" || -z "$API_HOST" ]]; then
	echo "[tunnel] Missing required env vars: CLOUDFLARE_AUTH_HOST and CLOUDFLARE_API_HOST." >&2
	echo "[tunnel] Keeping task alive without tunnel. Update env vars and restart bun dev." >&2
	exec tail -f /dev/null
fi

if ! command -v cloudflared >/dev/null 2>&1; then
	echo "[tunnel] cloudflared is not installed. Install with: brew install cloudflared" >&2
	echo "[tunnel] Keeping task alive without tunnel. Install cloudflared and restart bun dev." >&2
	exec tail -f /dev/null
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
	echo "[tunnel] Missing config at $CONFIG_FILE" >&2
	echo "[tunnel] Add ingress for localhost:3211 (auth), localhost:3210 (api), and optionally localhost:3000 (web)." >&2
	echo "[tunnel] Keeping task alive without tunnel. Add config and restart bun dev." >&2
	exec tail -f /dev/null
fi

ensure_dns_route() {
	local host="$1"
	local output
	if output="$(cloudflared tunnel route dns "$TUNNEL_NAME" "$host" 2>&1)"; then
		echo "[tunnel] DNS route ready: $host"
		return
	fi

	if printf "%s" "$output" | grep -qi "already exists"; then
		echo "[tunnel] DNS route already exists: $host"
		return
	fi

	echo "$output" >&2
	exit 1
}

if [[ "${CLOUDFLARE_SKIP_DNS_SETUP:-0}" != "1" ]]; then
	ensure_dns_route "$AUTH_HOST"
	ensure_dns_route "$API_HOST"
	if [[ -n "$WEB_HOST" ]]; then
		ensure_dns_route "$WEB_HOST"
	fi
fi

echo "[tunnel] Running $TUNNEL_NAME with $CONFIG_FILE"
exec cloudflared tunnel --config "$CONFIG_FILE" run "$TUNNEL_NAME"
