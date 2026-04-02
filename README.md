# Monorepo Template

A full-stack monorepo template with a **web app** (TanStack Start) and **mobile app** (Expo) sharing a **Convex** backend with **Better Auth** authentication.

## Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/)
- **Web:** [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Mobile:** [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend:** [Convex](https://convex.dev/)
- **Auth:** [Better Auth](https://better-auth.com/) (Google OAuth, magic link, anonymous, 2FA)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)

## Project Structure

```text
├── apps/
│   ├── web/                    # TanStack Start web application
│   └── mobile/                 # Expo React Native app
├── packages/
│   ├── backend/                # Convex backend shared by web + mobile
│   ├── dev-tunnel/             # Optional Cloudflare tunnel runner for local OAuth
│   └── typescript-config/      # Shared TypeScript configs
├── docs/
│   ├── AUTH_PORTING_NOTES.md
│   └── LOCAL_DEV_CONVEX_CLOUDFLARE.md
├── turbo.json
├── biome.json
└── package.json
```

## Prerequisites

- [Bun](https://bun.sh/) (v1.3.6+)
- A [Convex](https://convex.dev/) account
- (Optional) [Google Cloud Console](https://console.cloud.google.com/) project for Google OAuth
- (Optional, for real-device mobile OAuth on local backend) [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Initialize Convex

```bash
cd packages/backend
npx convex dev
```

This links your local workspace to a Convex deployment and writes `CONVEX_DEPLOYMENT`.

### 3. Choose deployment mode and set env vars

#### Cloud Convex deployment (recommended for staging/prod)

Use your cloud URLs:

- `*.convex.cloud` for API
- `*.convex.site` for Better Auth site URL

`apps/web/.env`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

`apps/mobile/.env`:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
```

Convex runtime env (Dashboard -> Settings -> Environment Variables):

```env
BETTER_AUTH_SECRET=your-random-secret-string
SITE_URL=https://your-deployment.convex.site
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# Optional
TRUSTED_ORIGINS=https://your-web-domain.com,https://staging.your-web-domain.com
MOBILE_APP_SCHEME=myapp
```

#### Local Convex deployment

For simulator/emulator and local web, direct local URLs work:

`apps/web/.env.local`:

```env
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
```

`apps/mobile/.env.local`:

```env
EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
EXPO_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211
```

For **real-device mobile Google OAuth** against local Convex, use a tunnel and HTTPS hostnames. See:

- `docs/LOCAL_DEV_CONVEX_CLOUDFLARE.md`

### 4. Run the dev servers

```bash
bun dev
```

This starts web, mobile, backend, and the optional tunnel task.

Tunnel task behavior:

- disabled by default
- set `CLOUDFLARE_TUNNEL_ENABLED=1` to run it from `bun dev`

Example:

```bash
CLOUDFLARE_TUNNEL_ENABLED=1 \
CLOUDFLARE_TUNNEL_NAME=monorepo-local \
CLOUDFLARE_AUTH_HOST=auth-local.your-domain.com \
CLOUDFLARE_API_HOST=api-local.your-domain.com \
CLOUDFLARE_WEB_HOST=web-local.your-domain.com \
bun dev
```

Generate `BETTER_AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## Auth Setup

Authentication is pre-configured with Better Auth + Convex.

Enabled methods:

- **Anonymous**
- **Google OAuth**
- **Magic Link** (email provider required)
- **Two-Factor (2FA)**

### Auth checklist

1. Ensure Convex runtime `SITE_URL` matches your auth host.
2. Configure Google callback URI as:
   - `https://<your-auth-host>/api/auth/callback/google`
3. For web social sign-in, pass an absolute callback URL on the web origin.
4. Set optional `TRUSTED_ORIGINS` for additional browser origins.
5. For mobile production deep links, set `MOBILE_APP_SCHEME` (defaults to `myapp`).

### Test Google OAuth in both apps

After `bun dev`:

1. Open web on `http://localhost:3000` and click **Sign in with Google** on the home screen.
2. Open mobile (Expo) and click **Sign in with Google** on the home screen.
3. Confirm each app shows `Signed in as ...` after callback.
4. Click **Sign out** in each app and confirm state returns to `Not signed in`.

### Auth plumbing

| File | Purpose |
|------|---------|
| `packages/backend/convex/auth.ts` | Better Auth server config, trusted origins, cross-domain plugin |
| `packages/backend/convex/http.ts` | Auth HTTP routes with CORS enabled |
| `apps/web/src/lib/auth-client.ts` | Web auth client with cross-domain client plugin |
| `apps/web/src/lib/auth-server.ts` | Web SSR auth integration |
| `apps/web/src/routes/api/auth/$.ts` | Web auth API route handler |
| `apps/mobile/lib/convex-urls.ts` | Mobile Convex API/site URL resolver |
| `apps/mobile/lib/auth-client.ts` | Mobile auth client setup |
| `packages/backend/scripts/dev.sh` | Syncs Convex `SITE_URL` before `convex dev` |

### Magic Link email

In `packages/backend/convex/auth.ts`, replace the `console.log` in `sendMagicLink` with your email provider integration.

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start all dev tasks |
| `bun run dev:web` | Start only the web app |
| `bun run dev:mobile` | Start only the mobile app |
| `bun run dev:backend` | Start only the backend |
| `bun run dev:tunnel` | Start only the tunnel task |
| `bun run build` | Build all apps |
| `bun run format-and-lint` | Run Biome checks |
| `bun run format-and-lint:fix` | Auto-fix Biome issues |
| `bun run check-types` | Type-check all packages |

## Carry-Over Analysis

Changes ported from the sibling `educanto` repo are documented in:

- `docs/AUTH_PORTING_NOTES.md`

That file explains what was carried over to the template, what was intentionally left out, and why.

## Customization

1. Rename package names in all `package.json` files.
2. Add your schema in `packages/backend/convex/schema.ts`.
3. Add Convex functions in `packages/backend/convex/`.
4. Add web routes in `apps/web/src/routes/`.
5. Add mobile screens in `apps/mobile/app/`.
6. Update trusted origins via Convex runtime env (`SITE_URL`, `TRUSTED_ORIGINS`).
7. Update Expo app scheme in `apps/mobile/app.json` and `MOBILE_APP_SCHEME`.
