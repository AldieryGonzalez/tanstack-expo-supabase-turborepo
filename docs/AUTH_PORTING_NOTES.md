# Auth Porting Notes (From `educanto` -> Template)

This document summarizes auth-related changes analyzed in `../educanto` and how they were applied to this template.

## Carry-over matrix

| Change from `educanto` | Carried over | Where | Why |
|---|---|---|---|
| Better Auth `crossDomain` plugin on backend | Yes | `packages/backend/convex/auth.ts` | Required for web/mobile flows where auth host differs from web origin. |
| Trusted origins derived from `SITE_URL` origin + optional `TRUSTED_ORIGINS` | Yes | `packages/backend/convex/auth.ts` | Avoids brittle hardcoded origins and supports cloud + local/tunnel hosts. |
| Stronger `SITE_URL` handling and validation | Yes | `packages/backend/convex/auth.ts` | Prevents silent misconfiguration when auth base URL is missing. |
| Web auth client `baseURL` from web origin + `crossDomainClient` | Yes | `apps/web/src/lib/auth-client.ts` | Keeps callbacks on the web domain while auth runs on Convex site host. |
| Convex auth routes with CORS enabled | Yes | `packages/backend/convex/http.ts` | Needed for cross-origin auth requests from web/mobile clients. |
| Mobile Convex URL helper (`convex-urls.ts`) | Yes | `apps/mobile/lib/convex-urls.ts`, `apps/mobile/lib/auth-client.ts`, `apps/mobile/app/_layout.tsx` | Centralizes API/site URL selection and supports both cloud and local flows. |
| Correct local Convex site port (`3211`) in env examples | Yes | `apps/web/.env.example`, `apps/mobile/.env.example`, `packages/backend/.env.example` | Auth endpoints live on site host (3211), not API host (3210). |
| Backend dev bootstrap to sync runtime `SITE_URL` | Yes | `packages/backend/scripts/dev.sh`, `packages/backend/package.json` | Keeps Convex runtime aligned with current local/tunnel auth host. |
| Cloudflare tunnel dev task | Yes (template-safe) | `packages/dev-tunnel/scripts/dev.sh` | Included as optional and disabled by default so base template remains runnable. |
| Vite allowed hosts for tunnel hostnames | Yes (env-driven) | `apps/web/vite.config.ts` | Prevents host blocking when accessing web via tunnel hostnames. |

## Intentionally not carried over

| `educanto` change | Template decision | Reason |
|---|---|---|
| Product-specific host defaults (`auth-local.educanto.app`, etc.) | Not copied | Template must remain domain-agnostic. |
| Product-specific mobile UI error messaging | Not copied | Out of scope for shared template auth plumbing. |
| Product-specific dependencies and app feature code | Not copied | Not part of auth portability requirements. |

## Notes for template consumers

1. For cloud deployments, use `*.convex.cloud` + `*.convex.site` URLs directly.
2. For local real-device OAuth, provide HTTPS auth host via tunnel and set matching Google callback URI.
3. Keep Convex runtime `SITE_URL` aligned with the auth host currently in use.
