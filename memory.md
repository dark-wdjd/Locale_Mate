# LocalMate China — Project Memory

_Last updated: 2026-08-23. This file records the project state, decisions, and next steps so work can resume at any time._

## 🌐 LIVE IN PRODUCTION (since 2026-07-21)

- **Live URL:** https://localmate-chengdu.onrender.com  (Render free web service. Render fixes the onrender.com subdomain at creation — it can't be renamed; to change it you create a new service and delete the old one. An earlier `localmate-j1yk` service was replaced this way and should be deleted.)
- **Host:** Render (app, auto-deploys on every push to GitHub `main`) + **TiDB Cloud Serverless** (MySQL-compatible database, free tier, always-on).
- **Render env vars** (set in Render dashboard → Environment): `DATABASE_URL` (TiDB localmate DB), `DATABASE_SSL=true`, `JWT_SECRET`, `ADMIN_PASSWORD` (the owner changed it from the suggested value — the value lives only in Render), `VITE_APP_ID=localmate`, `OWNER_OPEN_ID=admin`. Build command: `pnpm install --prod=false && pnpm build`; start: `pnpm start`.
- **TiDB connection** for local admin tasks (migrate/seed/export against production) is in the git-ignored `.env.production`. DB name is `localmate` (not the default `sys`).
- **Free-tier note:** Render sleeps the app after ~15 min idle; first visit then takes ~40s to wake. Upgrade path (no rework): Render paid instance or move to Railway.
- **Updating the live site:** code changes → push to `main`, Render redeploys automatically. Content changes → edit on the live `/admin` (writes straight to TiDB, persists immediately); no git needed. To refresh the repo's `scripts/seed-data.json` backup from production, run `export-content.mjs` with `.env.production`. **Or**, as done throughout this session: edit `scripts/seed-data.json` directly, run `node --env-file=.env.production scripts/seed-content.mjs` to push straight to TiDB (idempotent upsert), then commit the JSON so the repo stays in sync.

## What this project is

**LocalMate China** — an English-language Chengdu travel content site plus a curated directory of English-speaking local guides compiled from public Xiaohongshu/Douyin evidence. No in-site payments; visitors are directed to the guide's own public channels. Originally built with Manus; repo: https://github.com/dark-wdjd/Locale_Mate

**Stack**: React 19 + Vite + Tailwind + shadcn (client) · Express + tRPC (server) · MySQL via Drizzle ORM · pnpm.

**Local dev gotcha**: this Mac's default shell doesn't have `node` on PATH. Before running any `node`/`pnpm` command, run:
```
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20
```
(Node 22, which `.node-version` asks for, isn't installed — only 20 and 24 are. 20 works fine.)

## Current state (all pushed to GitHub main)

### 2026-08-23 session — guide directory grew from 5 to 18, plus SEO plumbing
- **13 new guide profiles** added, editorially compiled from Xiaohongshu profile links the owner supplied, each with exactly 2 sources (profile + at most 1 supporting post) — this 2-source cap is a standing instruction from the owner for all future guides, tighter than the earlier reconstructed profiles. New slugs: `maya`, `betty`, `xiao-o`, `xiaoyu`, `mala-big-bro`, `kacha-kacha`, `tina`, `nick`, `lin`, `lynne`, `holly`, `tangchaoer`, `chengdu-susan`. Avatars are cropped screenshots taken directly from each guide's Xiaohongshu profile page (saved to `client/public/guide_profile/`), inscribed-square-cropped from the circular profile photo via a small PIL script.
- **Directory now has 18 public profiles** (out of 21 rows in `seed-data.json` — 3 are `removed`: `xu-yao`, `chengdu-english-guide-susan`, `chengdu-english-guide-penny`, legacy duplicates from the original Manus-era reconstruction, kept for history).
- ⚠️ **Known open issue: two different "Susan" profiles.** `susan` (existing, avatar a white-blazer studio photo) and `chengdu-susan` (new, avatar a UN/diplomat-badge photo) have near-identical bios ("10 years' experience guiding foreign groups") but are **different Xiaohongshu account IDs** — verified genuinely different people, not a duplicate entry, but worth the owner's eyes since two similarly-named guides on one directory could confuse visitors. Could merge, rename, or relabel one.
- **One submitted profile was rejected**, not added: "英文导游Danny" is Hangzhou-based (浙江杭州) with zero Chengdu/Sichuan content — fails the site's own city-relevance standard in `docs/product-scope-and-editorial-standards.md`.
- **Basic SEO plumbing shipped** (commit `2ec41aa`):
  - `GET /sitemap.xml` (new `server/_core/sitemap.ts`) — static pages + all published guides + all published posts, loops past `listGuides`'s 100-row page cap so it won't silently truncate as the directory grows. Registered in `server/_core/index.ts` before the Vite/static catch-all so it isn't swallowed by the SPA fallback.
  - `robots.txt` now has a `Sitemap:` line.
  - Client-side schema.org JSON-LD via a new `useStructuredData` hook next to the existing `usePageMeta` hook in `client/src/pages/PublicPages.tsx`: `Person` on guide pages, `BlogPosting` on articles, `Organization` on the homepage. Explicitly cleared (`useStructuredData(null)`) on Directory/Blog-index/About/Claim pages — needed because this is a client-side-rendered SPA (wouter, no SSR) and in-app navigation was found to leave a *stale* JSON-LD block behind on pages that don't set their own; caught and fixed during testing.
  - `client/index.html` gained default `og:image` / `twitter:card` tags for non-JS link-preview bots (Slack/iMessage/Discord unfurls).
  - Verified live: `curl https://localmate-chengdu.onrender.com/sitemap.xml` and `/robots.txt` both return 200 with the expected content.
- **A competitive-analysis + growth-strategy report** was produced and published as a Claude Artifact (not part of this git repo) — covers the local-guide market landscape, a phased low-budget promotion roadmap, and a "guide flywheel" idea (tell the 21 profiled guides they're listed so they self-distribute the link). Ask the owner for the artifact link if picking this up again; it's not saved anywhere in-repo.
- Node/tooling note above (nvm) was discovered/needed throughout this session for every `pnpm`/`node` command.

### Earlier history (pre-2026-08-23)
- 2026-07-20 repo cleanup: removed all Manus-era leftovers (planning docs, todo.md, template.json, unused server modules like llm/imageGeneration/storageProxy/notification, unused client components, __manus__ debug collector, manus vite plugins). Kept: docs/product-scope-and-editorial-standards.md (editorial governance), OAuth plumbing in sdk/oauth/main.tsx (inert but load-bearing for sessions).
- Content is snapshot-driven: `scripts/export-content.mjs` dumps the live DB into `scripts/seed-data.json` (committed), and `scripts/seed-content.mjs` seeds any DB from that JSON (idempotent, verified lossless round-trip). **After editing content in admin, run the export and commit seed-data.json** so deployments match.
- `fe83fb1` — Reconstructed the final content into `scripts/seed-content.mjs`. The original production content lived only in the Manus database (now inaccessible), so it was rebuilt from facts recorded in the repo's tests and todo.md:
  - "After sunset fun in Chengdu" journal post — external-resource article linking to https://after-sunset.netlify.app, sorted last (`sortOrder: 100`), original publish date 2026-07-18.
  - Methodology journal post archived (hidden from the public journal; the About page remains).
  - Note: article bodies and some early guide bios are reconstructions, not the original wording.
- `28095a5` — `scripts/dev-admin-login.mjs`: creates a local admin user and prints a session cookie so `/admin` works without Manus OAuth.
- `04eee08` — Site photography (free-licensed, Wikimedia Commons, bundled in `client/public/images/`):
  - Homepage hero: Anshun Bridge & Jin River at dusk (Daniel Lu, CC BY-SA 4.0)
  - "First 48 Hours" cover: giant panda eating bamboo (MspreilsCN, CC BY 4.0)
  - "Tea, Food & Neighborhoods" cover: green tea in a park (McKay Savage, CC BY 2.0)
  - "After Sunset" cover: Anshun Bridge night view (Prcmise, CC BY-SA 4.0)
  - Attribution with source links is on the About page (license requirement — keep it).

Typecheck (`pnpm check`) passes as of this session's changes; the 19-test suite (`pnpm test`) was passing as of 2026-07-22 but wasn't re-run this session.

## Running locally (already set up on this Mac)

1. MySQL 9.7 runs as a Homebrew service (`brew services start mysql`), database `locale_mate`.
2. `.env` in the repo root (gitignored) holds: `DATABASE_URL=mysql://root@localhost:3306/locale_mate`, `JWT_SECRET` (any string), `VITE_APP_ID=local-dev-app`, `OWNER_OPEN_ID=local-admin`; the Manus vars (`OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_*`) are empty.
3. First-time database setup: `pnpm drizzle-kit migrate`, then `node --env-file=.env scripts/seed-content.mjs`.
4. Start: `pnpm dev` → http://localhost:3000 (remember the nvm gotcha above)
5. Admin login: open http://localhost:3000/admin and enter the `ADMIN_PASSWORD` from `.env` (currently `chengdu-admin-2026`). (The older cookie-based `scripts/dev-admin-login.mjs` helper still works too.)

GitHub pushes from this machine use the `dark-wdjd` account via the `gh` CLI (`gh auth status` to confirm).

## Remaining work (in priority order)

1. **Resolve the two-"Susan" situation** (see 2026-08-23 note above) — confirm with owner whether both are wanted, and if so consider a small copy tweak so visitors can tell them apart.
2. **Submit the sitemap to Google Search Console** — first real distribution step now that `/sitemap.xml` exists.
3. **Guide outreach** — tell the newly-added guides (and the original 5) they're featured, via a short Xiaohongshu comment/DM in Chinese, inviting them to claim their profile. Drafted as an idea in the growth-strategy artifact but no message has been sent yet.
4. **Penny's Xiaohongshu profile URL** — still never recorded in the repo as far as this session found; the owner would need to supply it to add as her source.
5. Optional cleanup: `server/_core/storageProxy.ts` (Manus storage proxy) and related forge/LLM helpers are unused once fully off Manus.
6. Consider whether a new tag (e.g. "food-culture") is warranted for guides like Mala Big Bro whose focus is cooking/food experiences rather than sightseeing — currently shoehorned into `city-classics` + `private-tour`.

## Key architecture facts

- Session auth: locally-signed HS256 JWTs (`jose`), verified in `server/_core/sdk.ts`; user roles in the `users` table; `OWNER_OPEN_ID` gets `admin` role on upsert (`server/db.ts`).
- Admin-only tRPC procedures check `user.role === 'admin'` (`server/_core/trpc.ts`).
- Public blog list orders by `sortOrder` asc, then featured/date (`server/db.ts` `listBlogPosts`); only `published` status is shown — the methodology post is `archived`, not deleted.
- Content lives in the database; `scripts/seed-content.mjs` is idempotent (safe to re-run) and is the source of truth for re-creating it.
- `listGuides()` in `server/db.ts` hard-caps `limit` at 100 (`Math.min(input.limit ?? 24, 100)`) regardless of what's requested — anything that needs *all* guides (like the sitemap route) must loop with `offset` rather than requesting a huge limit.
- This is a fully client-side-rendered SPA (wouter router, no SSR/prerendering) — `server/_core/vite.ts` serves the same `index.html` for every route in both dev and prod via a catch-all. Per-page `<title>`/meta/JSON-LD is all injected client-side after React mounts (`usePageMeta`/`useStructuredData` hooks in `PublicPages.tsx`), which works for Google but not for crawlers that don't execute JS — a known, accepted tradeoff, not a bug.
