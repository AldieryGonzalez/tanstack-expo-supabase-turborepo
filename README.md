# Monorepo Template

A full-stack monorepo template with a TanStack Start web app, an Expo mobile app, and a shared PostgreSQL/Drizzle data layer. Authentication is hosted by the web app with Better Auth, and the database is intended to be backed by Supabase Postgres.

## Stack

- Turborepo + Bun
- TanStack Start + TanStack Router + Tailwind CSS
- Expo + Expo Router
- PostgreSQL + Drizzle ORM
- Better Auth

## Workspace Layout

```text
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── db/
│   └── typescript-config/
├── turbo.json
├── biome.json
└── package.json
```

## Environment

### Required server env

Set these where the web app runs:

```env
BETTER_AUTH_SECRET=replace-me
GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
```

`DATABASE_URL` is only required when you want the apps and Drizzle to target a hosted database such as Supabase. If it is unset, the shared DB package falls back to `postgres://postgres:postgres@127.0.0.1:5432/postgres`.

### Optional server env

```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
MOBILE_APP_SCHEME=myapp
DATABASE_SSL=true
```

Notes:

- For Supabase pooler connections, keep prepared statements disabled. The shared DB package already does this.
- For local Postgres, set `DATABASE_SSL=false`.
- `BETTER_AUTH_URL` should be the public origin serving the web app. Better Auth is mounted at `/api/auth/*`.

### Web env

```env
VITE_AUTH_BASE_URL=http://localhost:3000
```

### Mobile env

```env
EXPO_PUBLIC_AUTH_URL=http://localhost:3000
```

For iOS simulators, `http://localhost:3000` usually works. For Android emulators or physical devices, point `EXPO_PUBLIC_AUTH_URL` at a reachable host.

## Getting Started

1. Install dependencies.

```bash
bun install
```

2. Generate the Better Auth Drizzle schema if you change auth plugins or providers.

```bash
bunx @better-auth/cli@latest generate \
  --config apps/web/src/lib/auth-server.ts \
  --output packages/db/src/auth-schema.ts \
  --yes
```

3. Start the local Postgres container.

`bun dev` now includes the `@monorepo/db` package's `dev` task, which starts a Docker-backed Postgres instance on `127.0.0.1:5432`. Docker Desktop or another Docker engine must be running first.

If you need to stop only the local database:

```bash
bun run db:down
```

4. Generate and apply database migrations.

```bash
bun run db:generate
bun run db:migrate
```

5. Start the apps.

```bash
bun dev
```

## Auth Flow

- The web app hosts Better Auth at `/api/auth/*` in [apps/web/src/routes/api/auth/$.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/apps/web/src/routes/api/auth/$.ts).
- The Better Auth server is configured in [apps/web/src/lib/auth-server.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/apps/web/src/lib/auth-server.ts).
- The shared Drizzle client lives in [packages/db/src/database.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/packages/db/src/database.ts).
- Better Auth schema tables are generated into [packages/db/src/auth-schema.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/packages/db/src/auth-schema.ts).
- The mobile app talks to the hosted auth backend via [apps/mobile/lib/auth-base-url.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/apps/mobile/lib/auth-base-url.ts).

## Scripts

- `bun dev` runs package dev tasks, including the local Postgres container owned by `@monorepo/db`.
- `bun run dev:web` starts only the web app.
- `bun run dev:mobile` starts only the mobile app.
- `bun run db:up` starts the local Postgres container.
- `bun run db:down` stops the local Postgres container.
- `bun run db:generate` creates Drizzle migration files.
- `bun run db:migrate` applies Drizzle migrations and auto-starts the local Postgres container when `DATABASE_URL` is unset.
- `bun run db:push` pushes the current schema and auto-starts the local Postgres container when `DATABASE_URL` is unset.
- `bun run db:studio` opens Drizzle Studio and auto-starts the local Postgres container when `DATABASE_URL` is unset.
- `bun run check-types` runs package typechecks.
- `bun run build` builds the workspace.

## Next Customization Points

- Add your application tables next to [packages/db/src/auth-schema.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/packages/db/src/auth-schema.ts) and re-export them from [packages/db/src/schema.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/packages/db/src/schema.ts).
- Expand [apps/web/src/lib/auth-server.ts](/Users/aldiery/repos/tanstack-expo-supabase-turborepo/apps/web/src/lib/auth-server.ts) if you want email/password, magic links, OTP, or additional providers.
- Point `EXPO_PUBLIC_AUTH_URL` at a reachable web origin for native-device authentication.
