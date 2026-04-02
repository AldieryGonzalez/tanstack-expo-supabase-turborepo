# Local Convex + Cloudflare Tunnel (Web + Mobile)

This runbook covers local development for:

- web app (`apps/web`)
- mobile app (`apps/mobile`)
- shared Convex backend (`packages/backend`)
- Better Auth + Google OAuth

Use this when OAuth must work on a physical phone while backend services run locally.

## Why this setup exists

- Google OAuth rejects insecure/non-HTTPS redirect URIs.
- `localhost` on a phone points to the phone, not your laptop.
- Local Convex ports (`3210` / `3211`) are not internet-routable.

Cloudflare Tunnel gives stable HTTPS hostnames that map to your local services.

## Host and port model

Use this mapping:

- `auth-local.<your-domain>` -> `http://localhost:3211` (Convex site/auth host)
- `api-local.<your-domain>` -> `http://localhost:3210` (Convex API host)
- `web-local.<your-domain>` -> `http://localhost:3000` (optional web tunnel)

Important:

- Keep Convex runtime `SITE_URL` aligned with the auth hostname.
- Port `3211` serves auth endpoints; web app routes are still served by `apps/web`.

## OAuth request flow

1. Mobile calls `signIn.social` against auth host.
2. Better Auth redirects to Google.
3. Google redirects to:
   - `https://auth-local.<your-domain>/api/auth/callback/google`
4. Better Auth completes login and appends a one-time token (`?ott=...`) to callback target.
5. Web callback target should be absolute on web origin.

Seeing `?ott=...` is expected.

## One-time setup

### 1. Create tunnel + DNS routes

```bash
cloudflared tunnel login
cloudflared tunnel create monorepo-local
cloudflared tunnel route dns monorepo-local auth-local.<your-domain>
cloudflared tunnel route dns monorepo-local api-local.<your-domain>
cloudflared tunnel route dns monorepo-local web-local.<your-domain> # optional
```

### 2. Create Cloudflare config

`~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /Users/<you>/.cloudflared/<TUNNEL_UUID>.json
ingress:
  - hostname: auth-local.<your-domain>
    service: http://localhost:3211
  - hostname: api-local.<your-domain>
    service: http://localhost:3210
  - hostname: web-local.<your-domain> # optional
    service: http://localhost:3000
  - service: http_status:404
```

Validate:

```bash
cloudflared tunnel --config ~/.cloudflared/config.yml ingress validate
```

### 3. Configure Google OAuth

Add this authorized redirect URI in Google Cloud Console:

```text
https://auth-local.<your-domain>/api/auth/callback/google
```

### 4. Configure Convex runtime env

Set runtime `SITE_URL` to your auth hostname:

```bash
cd packages/backend
npx convex env set SITE_URL https://auth-local.<your-domain>
```

Verify:

```bash
npx convex env list | rg '^SITE_URL='
```

## Template integration points

- `packages/backend/scripts/dev.sh`
  - syncs Convex `SITE_URL` from:
    - `MONOREPO_AUTH_URL`, else
    - `CLOUDFLARE_AUTH_HOST` (as `https://...`), else
    - `http://127.0.0.1:3211`
- `packages/dev-tunnel/scripts/dev.sh`
  - optional tunnel runner used by Turbo `dev`
  - enabled with `CLOUDFLARE_TUNNEL_ENABLED=1`

## Env files

### Web (`apps/web/.env.local`)

```env
CONVEX_DEPLOYMENT=local:your-local-deployment
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
```

### Mobile (`apps/mobile/.env.local`)

Tunnel mode (recommended on physical devices):

```env
CONVEX_DEPLOYMENT=local:your-local-deployment
EXPO_PUBLIC_CONVEX_URL=https://api-local.<your-domain>
EXPO_PUBLIC_CONVEX_SITE_URL=https://auth-local.<your-domain>
```

Direct local mode (simulator/emulator):

```env
CONVEX_DEPLOYMENT=local:your-local-deployment
EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
EXPO_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211
```

### Backend runtime env (Convex Dashboard)

- `SITE_URL=https://auth-local.<your-domain>` (tunnel mode)
- `BETTER_AUTH_SECRET=...`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- optional: `TRUSTED_ORIGINS=https://web-local.<your-domain>,https://staging.example.com`
- optional: `MOBILE_APP_SCHEME=myapp`

## Day-to-day commands

Run full stack + optional tunnel task:

```bash
CLOUDFLARE_TUNNEL_ENABLED=1 \
CLOUDFLARE_TUNNEL_NAME=monorepo-local \
CLOUDFLARE_AUTH_HOST=auth-local.<your-domain> \
CLOUDFLARE_API_HOST=api-local.<your-domain> \
CLOUDFLARE_WEB_HOST=web-local.<your-domain> \
bun dev
```

Run only the tunnel task:

```bash
CLOUDFLARE_TUNNEL_ENABLED=1 \
CLOUDFLARE_TUNNEL_NAME=monorepo-local \
CLOUDFLARE_AUTH_HOST=auth-local.<your-domain> \
CLOUDFLARE_API_HOST=api-local.<your-domain> \
CLOUDFLARE_WEB_HOST=web-local.<your-domain> \
bun run dev:tunnel
```

## Verification checklist

```bash
curl -sS https://api-local.<your-domain> | head -n 1
curl -sS -o /dev/null -w "%{http_code}\n" https://auth-local.<your-domain>/api/auth/get-session
cd packages/backend && npx convex env list | rg '^SITE_URL='
```

Expected:

- API endpoint responds.
- Auth session endpoint returns `200`.
- `SITE_URL` matches your auth hostname.

## Common failure modes

### `redirect_uri_mismatch`

Cause:

- redirect URI in Google console does not exactly match callback URL.

Fix:

- add exact callback URI:
  - `https://auth-local.<your-domain>/api/auth/callback/google`

### `No matching routes found` after callback

Cause:

- callback URL is relative (for example `"/learn"`) and gets resolved under auth host.

Fix:

- use absolute callback URL on web origin:
  - `callbackURL: ${window.location.origin}/learn`

### Tunnel cannot connect to `3210`/`3211`

Cause:

- backend not running or wrong ingress mapping.

Fix:

1. check listeners:
   - `lsof -nP -iTCP:3210 -sTCP:LISTEN`
   - `lsof -nP -iTCP:3211 -sTCP:LISTEN`
2. verify Cloudflare ingress config.
3. restart `bun dev`.
