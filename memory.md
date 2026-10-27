# LocalMate China — Project Memory

_Last updated: 2026-10-26. This file records the project state, decisions, and next steps so work can resume at any time._

## ⚠️ 2026-10-26: Render free-hour limit

- Render's free tier allows **750 instance-hours per month for the whole workspace**. With UptimeRobot keeping `localmate-chengdu` awake, that one service alone uses about 744 h in a 31-day month. An old leftover service, `localmate`, was eating hours too: 616 of 750 were used by Oct 26, and the services would have been suspended until Nov 1.
- The owner **deleted the old `localmate` service** on 2026-10-26. The live site was checked afterwards and is fine. October will be very tight (about 134 h left for about 132 h needed).
- **Recommendation pending:** upgrade `localmate-chengdu` to **Starter ($7/mo)**. That means no hour cap and no sleeping, so UptimeRobot can be retired. **Never run a second free service on this workspace** while the site relies on UptimeRobot.

## 🔍 2026-10-21 to 10-23: Search Console duplicates, journal layout, Reddit plan

- **Search Console (2026-10-21):** 10 impressions, average position 10.7; visitors from the US, Italy, Taiwan, Hong Kong and Canada; only the homepage, /guides, /blog and /about had impressions so far. The Page indexing report was still "processing".
- **"Duplicate, Google chose different canonical than user" (2026-10-23):** `/guides/rebirth-chengdu-guide` was not indexed; Google picked `/guides/hanfu-english-guide` as canonical. The owner confirmed they are **different people**. Fixes:
  - `8cf5edc`: the server-rendered homepage no longer lists every guide (it was 97% identical to /guides; now 14%).
  - `ff1a602`: server-rendered guide pages now include city, languages, tags, each source's evidence summary, similar guides and related articles. The two repeated closing sentences ("This profile is editorially compiled…" / "Ask the guide directly…") were removed from all longBios. **Don't add them back when creating new guides.**
  - **april, yanny, penny and susan re-researched on 2026-10-23** (each Xiaohongshu profile reviewed via its xhslink): English short and long bios, evidence summaries and adjusted tags. They now run 234–273 server-rendered words; the most similar pair of guide pages across the whole site is about 57% (it was 80%).
  - "Alternate page with proper canonical tag" for `/guides?tag=…` is expected.
- **Journal layout (`b90040a`):** row cards (image left, text right, about 260px tall), a 21:9 article cover, and in-article photos cropped to 16:9 with small grey captions. Streamdown's harden plugin needed `defaultOrigin` to stop blocking relative image URLs (`ccb4d6d`).
- **Panda article photos (`53041de`):** 6 Wikimedia Commons photos (CC BY / BY-SA), credited in captions, with the cover also credited on the About page.
- **Reddit:** the competitor runs r/meetlocalchengdu (about 1,000 weekly visitors after 9 months; insider-content posts work best). Our plan is in `marketing/reddit/plan.md` (r/MeetChengdu; not created yet). Reddit is blocked for Claude in Chrome and for WebFetch, so the owner has to share screenshots.

## 🐼 2026-10-18: site name and first new article

- **Site-name signals (commit `4100044`):** after searching "Meet Chengdu" put the site on page 11 (Google read it as "meet people in Chengdu"; dating sites rank first), the homepage got WebSite JSON-LD (name MeetChengdu, alternateName "Meet Chengdu" and meetchengdu.com) and a brand-first title, and the footer says "Meet Chengdu (MeetChengdu) is…" on every page. The owner should request indexing of the homepage.
- **Published `/blog/chengdu-panda-base-guide`** ("Chengdu Panda Base: A Simple Visitor's Guide (2026)", about 1,100 words). Per the owner, it's a plain introduction with **no guide promotion**. Unverified facts (CNY 55 price, on-site ticket sales, winter session times, metro station) are worded as "check the official channel"; re-check them in November. It reuses the cover image `/images/cover-first-48-hours-panda.jpg`. Source of truth: `marketing/drafts/chengdu-panda-base-guide.md` plus the `articles` array in seed-data.
- Competitor noted: **meetlocalchengdu.com** (Luna, a licensed guide; registered Jan 2026; 32 pages and about 40k words; ranks around #4 for "free walking tour Chengdu"). It covers walking, food and experiences in central Chengdu, and has almost no panda, Sanxingdui, Jiuzhaigou or Leshan guide content, which is our opening.

## 📁 2026-10-16: repo location

- The repo now lives at **`/Users/rl/claude/local_mate`**. It was moved from `~/Documents/playground/Locale_Mate`, which was deleted after the move; git history, `.env` files and `node_modules` came along unchanged. Start Claude Code sessions from this folder.

## 🏷️ 2026-10-16: brand renamed LocalMate China → **MeetChengdu**

- Owner's decision, to match the domain. Every user-facing string was changed: page titles (`… | MeetChengdu`), og:site_name, JSON-LD Organization/author, the logo (badge `MC`, wordmark "MeetChengdu", subline "English-speaking local guides" / "成都英语本地向导"), translations, admin header, article text in `scripts/seed-data.json` (re-seeded), and the marketing drafts.
- **Left as-is on purpose:** internal identifiers such as the `localmate-language` localStorage key (renaming it would reset visitors' language choice), the `localmate-*` CSS keyframes and storage keys, the `"localmate"` salt fallback, test names, the repo name `Locale_Mate`, and the Render service name `localmate-chengdu`. Historical notes in this file still say "LocalMate"; that's fine.

## 📣 2026-10-15: marketing and SEO kickoff (research and drafts only; nothing published)

- **Owner decision:** *no guide outreach until the site has real traffic*. Focus on traveler-facing marketing and SEO. Agents only research and draft; the owner posts everything personally. The owner has 2–3 hours a week and no budget, and has accounts on Reddit, TripAdvisor, Facebook and Xiaohongshu.
- Three research agents wrote into `marketing/`:
  - `seo-audit.md`: 16 prioritized on-site fixes. The top ones: real 404/410 status codes (soft 404s confirmed live), English-first guide titles (23 of 31 are Chinese handles), server-rendered blog bodies (only about 30 words are in the server HTML today), thicker guide pages, and server-side JSON-LD.
  - `content-plan.md` plus `drafts/how-to-hire-english-speaking-guide-chengdu.md` and `drafts/chengdu-panda-base-booking-gates-timing.md`: 8 long-tail topics; the Panda Base draft has a [VERIFY] note on on-site ticket sales.
  - `community-playbook.md`: TripAdvisor is the most viable channel (no self-promotion; put the site link in the profile's "About me"; link only when someone asks how to find a guide, with a disclosure). Reddit could not be fetched by the agent (403), so its rules and thread URLs are unverified. Wikivoyage bans directory links.
- **SEO batch A shipped (commits `bdc0a0a` and `fe15845`):** real 404/410 status codes (noindex; mixed-case slugs 301 to lowercase; /admin is noindex), full article bodies rendered server-side with `marked`, server-side JSON-LD (`id="ld-json"`), descriptions clipped to 155 characters, avatars switched to WebP (3.2 MB → 259 KB) with lazy loading, the hero alt text fixed, and Penny's cut-off bio fixed. **Still open (batch B, needs the owner's decision):** English-first guide titles (needs an English name per guide), possibly renaming the brand LocalMate China → MeetChengdu, thicker guide pages, interest landing pages, and the rest of `marketing/seo-audit.md`.
- Weekly routine: 1 hour of community replies, 1 hour reviewing and publishing an article every two weeks, and 30 minutes of Search Console.

## 🌐 2026-10-14: custom domain www.meetchengdu.com + server-rendered SEO

- **Canonical site URL is now https://www.meetchengdu.com** (domain bought at Porkbun). Porkbun DNS: `ALIAS @ → localmate-chengdu.onrender.com` and `CNAME www → localmate-chengdu.onrender.com`. Both are verified in Render → Custom Domains. Render itself 301s the bare domain to `www` (Render picked www as primary), so **www is canonical**. Don't set CANONICAL_HOST to the bare domain, or the two redirects will loop.
- **Render env vars added:** `SITE_URL=https://www.meetchengdu.com`, `CANONICAL_HOST=www.meetchengdu.com`. The app 301s any other host (the old onrender URL) to www.
- **Why there were zero impressions (diagnosed 2026-10-11):** every URL served the identical empty SPA shell (same title/description, empty body) on a zero-authority onrender.com subdomain with no backlinks. **Fix (commit `0553a75`):** new `server/_core/seo.ts` injects each route's own title, description, canonical, og tags and a plain-HTML summary into index.html (React replaces it on mount). robots.txt is now generated from SITE_URL (the static file was removed), sitemap uses the same SITE_URL, and the broken umami placeholder script was removed.
- **Done by the owner on 2026-10-14:** verified the Search Console URL-prefix property `https://www.meetchengdu.com` (via the existing meta tag/HTML file), submitted the sitemap, requested indexing for the key pages, ran "Change of address" from the old onrender property, pointed UptimeRobot at https://www.meetchengdu.com/robots.txt, and deleted Porkbun's default URL-forwarding rule.
- ⚠️ **Gotcha:** deleting the Porkbun URL-forward also deleted the root ALIAS record, so the bare domain stopped resolving (browsers that had cached the 301 hid this). The ALIAS was re-added and verified on Porkbun NS, 8.8.8.8 and 1.1.1.1. After any Porkbun DNS change, check with `dig +short A meetchengdu.com @8.8.8.8`.
- **Next check (around 2026-10-21 to 2026-10-28):** in Search Console → Pages, see whether the indexed count is rising; impressions should follow within 1 to 3 weeks. If many URLs show "Crawled – currently not indexed" after about 2 weeks, work on original content and backlinks.
- Note: the Chrome profile that Claude in Chrome uses is signed into a different Google account, which has no access to the Search Console property.
- Next SEO steps: backlinks (Reddit r/chengdu and r/chinatravel, TripAdvisor forum answers, guides linking to their profile) and guide outreach.

## 👥 2026-10-10 session: 13 new guides (18 → 31 public) + liability disclaimer

- **Browser-assisted discovery** (new editorial decision recorded in `docs/product-scope-and-editorial-standards.md`): Claude used Claude in Chrome in the owner's logged-in browser to search Xiaohongshu for 成都英语导游 / 成都英文导游 at a human pace, opened each candidate's profile, and checked them against the four inclusion criteria. Bulk or scheduled scraping is still prohibited, and Claude stops if a captcha or risk-control prompt appears. Tip: reading `xsec_token` from the DOM via JS is blocked by the extension, so click into profiles from search results instead (each opens in a new tab whose URL carries the token).
- **Added (commit `72f20eb`, seeded to TiDB):** `tommy`, `fiona`, `charles`, `hanfu-english-guide`, `lucky`, `libby`, `melody`, `shanyu`, `shirley` (Shirley英语), `chengdu-shirley` (成都英语导游Shirley), `laura`, `jenny`, `rebirth-chengdu-guide`. Each has 1 profile source (within the 2-source cap). Avatars were cropped from a zoom screenshot of the profile circle to 300×300.
- **Rejected:** Duncan (that post was looking *for* a guide, not offering guiding).
- ⚠️ **Weaker evidence, worth a second look:** `chengdu-shirley` (one post seeks a license-exam study partner, so licensing is unconfirmed), `melody` (bio doesn't mention guiding), and `shanyu` / `lucky` / `jenny` (very small accounts).
- ⚠️ **Two Shirleys now**, the same issue as the two Susans. Both bios say they're different accounts; the owner hasn't decided whether to keep both.
- **Liability disclaimer (commit `2ff50f1`):** new "Independent listings, not endorsements" section on the About page (EN/ZH, keys `about.disclaimer*`), a one-line `guide.disclaimer` in the guide-page sidebar, an extra sentence in the offsite dialog, and a matching FAQ JSON-LD entry. Caveat discussed with the owner: a disclaimer can't exclude liability for personal injury or for the owner's own gross negligence (PRC Civil Code art. 506), and wrong information that the site itself publishes is still the site's responsibility. Not legal advice.
- Note: Claude Code's auto-mode classifier blocked the first push of these profiles as personal-data handling; it went through after the owner explicitly approved in chat.

## 🚀 2026-09-10 session — SEO round 2 (commit `7945675`, pushed)

- **Image performance:** Yanny's oversized avatar fixed (561×589 → 300×300, 560KB → 148KB, matching the other avatars' crop standard). The 4 hero/cover JPGs in `client/public/images/` were resized to a 1600px max dimension at q82 (35–45% smaller each).
- **FAQPage JSON-LD on the About page** (`AboutPage` in `client/src/pages/PublicPages.tsx`), built from the page's existing publish / don't-publish / verify / opt-out copy. No new claims; the copy is only reformatted as Q&A in case it becomes eligible for rich results. The question strings are hard-coded English; the answers come from `t(...)`.
- **Internal linking on guide detail pages:** a "Similar Chengdu guides" section (guides sharing a tag) and a "Mentioned in the journal" sidebar card (published articles linked through the existing `blogGuideLinks` table). The new queries `getSimilarGuides` and `getRelatedArticlesForGuide` in `server/db.ts` are wired into `getGuideBySlug`. New i18n keys `guide.similarGuides` and `guide.mentionedIn` are in `client/src/lib/translations.ts`.
- No activity since then: the working tree is clean and `main` matches `origin/main` (checked 2026-10-03).

## ✅ Sitemap indexing blocker resolved (2026-09-09)

The "Could not fetch" sitemap error in Search Console (first spotted 2026-09-02) turned out to be caused by Render's free tier sleeping the app after ~15 min idle (~34s cold-start, way past Google's fetch timeout). The fix took two tries:
1. **First attempt (failed): GitHub Actions scheduled workflow** pinging every 10 min. Looked reasonable but GitHub actually only ran it every 100–340 minutes in practice — it deprioritizes frequent cron schedules under platform load. Removed after confirming via `gh run list` timestamps that it wasn't working.
2. **Working fix: UptimeRobot** (free tier, external account, pings `/robots.txt` every 5 min on a guaranteed interval). Verified via a 30-min cold-test with zero pings from this session that the site stayed warm.

After that, the owner resubmitted the sitemap in Search Console and it now shows **"Success."** Lesson for future "keep something warm/alive" needs on this project: don't rely on GitHub Actions `schedule:` cron for sub-hourly precision — use a purpose-built external pinger instead.

## ⏸️ Project paused 2026-08-30, resumed 2026-09-02 for the indexing issue above

Owner had stepped away, came back specifically to chase down the Search Console error, which is now resolved. Everything is committed and pushed.

## 🌐 LIVE IN PRODUCTION (since 2026-07-21)

- **Live URL:** https://www.meetchengdu.com (since 2026-10-14; the old https://localmate-chengdu.onrender.com 301-redirects there)  (Render free web service. Render fixes the onrender.com subdomain at creation — it can't be renamed; to change it you create a new service and delete the old one. An earlier `localmate-j1yk` service was replaced this way and should be deleted.)
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

### 2026-08-26–30 session — Google Search Console live, alt-text fix, growth-hack ideas (not yet built)
- **Google Search Console set up and verified** for `https://localmate-chengdu.onrender.com` (URL-prefix property), using **both** verification methods for redundancy:
  - Meta tag `google-site-verification` in `client/index.html` (commit `637d926`)
  - HTML file `client/public/googleb73a0050d089f52c.html`, served at the site root like `robots.txt` (same commit)
  - Sitemap (`sitemap.xml`) was submitted in Search Console by the owner.
  - **Status as of pause: 0 pages indexed by Google yet** (`site:localmate-chengdu.onrender.com` search returns nothing). This is normal for a brand-new site — indexing typically takes days to a few weeks — not a bug or misconfiguration. Next session should check the Search Console **Pages** report for real status, and consider using **URL Inspection → Request Indexing** on the homepage to nudge it (this was explained to the owner but not yet done).
  - Also discussed: "成都 Local Guide" / "Chengdu local guide" is a competitive commercial term already dominated by long-established sites (ToursByLocals, China Highlights, TripAdvisor, TravelChinaGuide) — realistic expectation is that ranking for broad terms will take a long time regardless of indexing; the long-tail keyword strategy (see growth-strategy artifact) is the more winnable path short-term.
- **Fixed empty `alt=""` on blog cover images** (commit `f3a58cb`) — both the article-card thumbnail and the full article-page hero image now use the post's title as alt text, in `client/src/pages/PublicPages.tsx`.
- **Growth-hack ideas discussed with the owner, none implemented yet** — worth revisiting first when resuming, since they're cheap/fast:
  1. Turn "you're featured" guide outreach into a **shareable graphic/screenshot** of their profile (not just a text message) — more likely to get reposted to their own Xiaohongshu/朋友圈.
  2. Write content riding the **already-viral "熊猫基地不排队" (skip the Panda Base queue) topic** instead of inventing a new one — several featured guides' own posts on this theme got hundreds of likes.
  3. **Real-time "comment-jacking"**: monitor Xiaohongshu posts tagged #成都英语导游 / #chengdutravel for people actively asking for a guide recommendation, and reply directly with a link — higher intent than passive content marketing.
  4. **Physical QR stickers at the Panda Base exit** (and Chunxi Road tourist info booth, foreign-friendly cafes) — highest foreigner-density real-world touchpoint, near-zero cost.
  5. Turn the **duplicate-"Susan" discovery itself into a transparency case-study blog post** ("how we verify every guide") — demonstrates the site's actual differentiator instead of just claiming it.
- Still open from before: the "is it safe to hire a private guide in China" trust-keyword field note (discussed, not written) and the guide-outreach message itself (discussed, not drafted/sent).

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

1. **Check Google Search Console indexing status** (new property: https://www.meetchengdu.com, set up 2026-10-14). The sitemap has shown "Success" since 2026-09-09, but nobody has checked indexed-page counts since. Also confirm that UptimeRobot is still pinging and that the new FAQ / internal-link changes look right in URL Inspection. Original note: 0 pages were indexed as of the 2026-08-30 pause; check the **Pages** report, and use **URL Inspection → Request Indexing** on the homepage if it's still empty. (Sitemap already submitted; verification already done — see 2026-08-26–30 session above.)
2. **Resolve the two-"Susan" situation** (see 2026-08-23 note above) — confirm with owner whether both are wanted, and if so consider a small copy tweak so visitors can tell them apart.
3. **Guide outreach** — tell all 31 featured guides (including the 13 added 2026-10-10) they're listed, via a short Xiaohongshu comment/DM in Chinese, inviting them to claim their profile. Consider pairing it with a shareable screenshot/graphic of their profile (growth-hack idea #1 above) rather than plain text — not yet drafted or sent.
4. **Write the trust-keyword field note** — "is it safe to hire a private guide in China" — discussed as the highest-value next content piece, not yet written.
5. **Try one of the growth-hack ideas** above (queue-skip content, comment-jacking, QR stickers, or the transparency case-study post) — pick whichever is cheapest to test first.
6. **Penny's Xiaohongshu profile URL** — still never recorded in the repo as far as this session found; the owner would need to supply it to add as her source.
7. Optional cleanup: `server/_core/storageProxy.ts` (Manus storage proxy) and related forge/LLM helpers are unused once fully off Manus.
8. Consider whether a new tag (e.g. "food-culture") is warranted for guides like Mala Big Bro whose focus is cooking/food experiences rather than sightseeing — currently shoehorned into `city-classics` + `private-tour`.

## Key architecture facts

- Session auth: locally-signed HS256 JWTs (`jose`), verified in `server/_core/sdk.ts`; user roles in the `users` table; `OWNER_OPEN_ID` gets `admin` role on upsert (`server/db.ts`).
- Admin-only tRPC procedures check `user.role === 'admin'` (`server/_core/trpc.ts`).
- Public blog list orders by `sortOrder` asc, then featured/date (`server/db.ts` `listBlogPosts`); only `published` status is shown — the methodology post is `archived`, not deleted.
- Content lives in the database; `scripts/seed-content.mjs` is idempotent (safe to re-run) and is the source of truth for re-creating it.
- `listGuides()` in `server/db.ts` hard-caps `limit` at 100 (`Math.min(input.limit ?? 24, 100)`) regardless of what's requested — anything that needs *all* guides (like the sitemap route) must loop with `offset` rather than requesting a huge limit.
- This is a fully client-side-rendered SPA (wouter router, no SSR/prerendering) — `server/_core/vite.ts` serves the same `index.html` for every route in both dev and prod via a catch-all. Per-page `<title>`/meta/JSON-LD is all injected client-side after React mounts (`usePageMeta`/`useStructuredData` hooks in `PublicPages.tsx`), which works for Google but not for crawlers that don't execute JS — a known, accepted tradeoff, not a bug.
