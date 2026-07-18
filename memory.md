# LocalMate China — Project Memory

_Last updated: 2026-07-18. This file records the project state, decisions, and next steps so work can resume at any time._

## What this project is

**LocalMate China** — an English-language Chengdu travel content site plus a curated directory of English-speaking local guides compiled from public Xiaohongshu/Douyin evidence. No in-site payments; visitors are directed to the guide's own public channels. Originally built with Manus; repo: https://github.com/dark-wdjd/Locale_Mate

**Stack**: React 19 + Vite + Tailwind + shadcn (client) · Express + tRPC (server) · MySQL via Drizzle ORM · pnpm.

## Current state (all pushed to GitHub main)

- `fe83fb1` — Reconstructed the final content into `scripts/seed-content.mjs`. The original production content lived only in the Manus database (now inaccessible), so it was rebuilt from facts recorded in the repo's tests and todo.md:
  - "After sunset fun in Chengdu" journal post — external-resource article linking to https://after-sunset.netlify.app, sorted last (`sortOrder: 100`), original publish date 2026-07-18.
  - Methodology journal post archived (hidden from the public journal; the About page remains).
  - Guides **Susan** (`chengdu-english-guide-susan`, with her verified Xiaohongshu profile source) and **Penny** (`chengdu-english-guide-penny`, initials avatar by design) added — 7 public profiles total.
  - Note: article bodies and the Susan/Penny bios are reconstructions, not the original wording. Edit freely via `/admin` or the seed script.
- `28095a5` — `scripts/dev-admin-login.mjs`: creates a local admin user and prints a session cookie so `/admin` works without Manus OAuth.
- `04eee08` — Site photography (free-licensed, Wikimedia Commons, bundled in `client/public/images/`):
  - Homepage hero: Anshun Bridge & Jin River at dusk (Daniel Lu, CC BY-SA 4.0)
  - "First 48 Hours" cover: giant panda eating bamboo (MspreilsCN, CC BY 4.0)
  - "Tea, Food & Neighborhoods" cover: green tea in a park (McKay Savage, CC BY 2.0)
  - "After Sunset" cover: Anshun Bridge night view (Prcmise, CC BY-SA 4.0)
  - Attribution with source links is on the About page (license requirement — keep it).

Typecheck (`pnpm check`) and all 19 tests (`pnpm test`) pass.

## Running locally (already set up on this Mac)

1. MySQL 9.7 runs as a Homebrew service (`brew services start mysql`), database `locale_mate`.
2. `.env` in the repo root (gitignored) holds: `DATABASE_URL=mysql://root@localhost:3306/locale_mate`, `JWT_SECRET` (any string), `VITE_APP_ID=local-dev-app`, `OWNER_OPEN_ID=local-admin`; the Manus vars (`OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_*`) are empty.
3. First-time database setup: `pnpm drizzle-kit migrate`, then `node --env-file=.env scripts/seed-content.mjs`.
4. Start: `pnpm dev` → http://localhost:3000
5. Admin login: `node --env-file=.env scripts/dev-admin-login.mjs` prints a token; in the browser console run
   `document.cookie = "app_session_id=<token>; path=/; max-age=31536000"` and reload `/admin`.

GitHub pushes from this machine use the `dark-wdjd` account via the `gh` CLI (`gh auth status` to confirm).

## Remaining work (in priority order)

1. **Publish publicly** — the original goal. Recommended: Railway (~$5/mo, Node app + MySQL together, deploys from GitHub). Required alongside hosting:
   - Replace the Manus OAuth admin login with simple self-hosted auth. The session layer (HS256 JWT signed with `JWT_SECRET`, cookie `app_session_id`) already works standalone — only the sign-in flow needs building.
   - Set production env vars: `DATABASE_URL`, `JWT_SECRET` (strong random), `OWNER_OPEN_ID`, `NODE_ENV=production`. Build with `pnpm build`, run with `pnpm start`.
   - Run migrations + seed against the production database.
2. **Penny's Xiaohongshu profile URL** — never recorded in the repo; the owner must supply it, then add as her source (admin panel or seed).
3. **Susan's avatar** — original lived on Manus storage; she currently shows initials. Optionally add a new image.
4. Optional cleanup: `server/_core/storageProxy.ts` (Manus storage proxy) and related forge/LLM helpers are unused once fully off Manus.

## Key architecture facts

- Session auth: locally-signed HS256 JWTs (`jose`), verified in `server/_core/sdk.ts`; user roles in the `users` table; `OWNER_OPEN_ID` gets `admin` role on upsert (`server/db.ts`).
- Admin-only tRPC procedures check `user.role === 'admin'` (`server/_core/trpc.ts`).
- Public blog list orders by `sortOrder` asc, then featured/date (`server/db.ts` `listBlogPosts`); only `published` status is shown — the methodology post is `archived`, not deleted.
- Content lives in the database; `scripts/seed-content.mjs` is idempotent (safe to re-run) and is the source of truth for re-creating it.
