---
description: MeetChengdu weekly routine — report, ≥5 guides, 1 article + 1 SEO revision, forum replies, pins, to-do list, next week's schedule
---

Run the MeetChengdu weekly routine. Read `memory.md` (change log + latest state), `marketing/weekly-system.md` (the playbook) and `marketing/guide-candidates.md` first. The owner reads Chinese; write the final summary in Chinese, keep site content in English.

**Goal:** phase 1 of the marketplace plan — maximum English-language impressions and clicks. Standing rules: no outreach to guides; the owner posts everything; no links in TripAdvisor replies; Reddit replies disclose ("I run…") if they link; ≤2 sources per guide; never change URLs; edit each page at most once every 3–4 weeks; new articles, revisions and SEO fixes wait for the owner's approval (guides are the exception, see step 2).

Node: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20`. Seed: `node --env-file=.env.production scripts/seed-content.mjs`. Push static images before seeding content that references them.

## 1. Data and scorecard
- Search Console in Chrome (property `https://www.meetchengdu.com/`, account xhsdraft1 has Full access). Read tables with javascript_tool via URL parameters: `.../performance/search-analytics?resource_id=https%3A%2F%2Fwww.meetchengdu.com%2F&num_of_days=7&metrics=CLICKS%2CIMPRESSIONS%2CPOSITION&breakdown=page|query|country|date`, filter one page with `&page=!<encoded url>`, a single day with `&start_date=YYYYMMDD&end_date=YYYYMMDD`. Also the Pages (indexing) report.
- Write `marketing/reports/YYYY-MM-DD.md`: **phase-1 scorecard first** (7-day impressions, clicks, avg position, pages with avg position ≤10, number of public guides, distance to the phase-2 threshold: ≥1,000 impressions and ≥30 clicks a week for 4 weeks, or ~300 Cloudflare visitors/month), then week-on-week changes, top pages/queries, effect of changes in the change log (revisions are judged 3 weeks after the edit), anomalies (e.g. bursts of machine-like queries), and the chosen article + revision with the reason. Discount the owner's own "meet chengdu" brand searches.

## 2. Guides: add at least 5 (allowed without asking)
- Search Xiaohongshu in Chrome (e.g. 成都英语导游, 成都英文导游, 四川英语导游, 熊猫基地英文讲解, 三星堆英文讲解, 乐山/峨眉/都江堰/九寨沟 英语导游). Over time widen areas and platforms (Douyin, TripAdvisor guide profiles).
- Add only people who **publicly advertise English guiding** in Chengdu/Sichuan. Use only what they published; no private contact details unless posted publicly for business. **Max 2 sources** (profile + 1 post). Check duplicates against all existing slugs, displayNames and source URLs (same person under two names = one profile). If anything is doubtful → "For your decision" in `marketing/guide-candidates.md`, not the site.
- Profile fields follow existing guides in `scripts/seed-data.json` (slug, displayName = their account name, englishName, seoTitle `<Name> – English Guide in Chengdu (<specialty>)` ≤ ~65 chars incl. " | MeetChengdu", shortBio, longBio describing only what the evidence shows (don't re-add the two boilerplate sentences removed earlier), city, languages, status `unclaimed`, tags from the existing tag set, avatarUrl `/guide_profile/<Name>.webp` 300×300 WebP if the public avatar is available, lastVerifiedAt, sources). Claims like "Senior" only if the profile says so.
- If fewer than 5 qualify, add fewer and say so. Seed, commit, push (auto mode may ask the owner to confirm a push with personal data; that's expected), verify `/guides/<slug>` returns 200 with the right title, request indexing for new profiles (they have priority for the shared ~10/day quota). Record every added/held/rejected candidate in `marketing/guide-candidates.md`.

## 3. Content: 1 new article draft + 1 SEO revision proposal
- **New article** → `marketing/drafts/<slug>.md` in the existing format (front matter: slug, title ≤60, seoTitle ≤60, seoDescription ≤155, excerpt, category, coverImageUrl, targetQuery, relatedArticles, status DRAFT, lastChecked; body with "short answer", sourced facts, checklist, internal links to hub + 2–3 siblings + /guides, Sources with dates). Topic order: real search queries without a dedicated page → `marketing/content-plan.md` queue → recurring forum questions. Cover from Wikimedia Commons (CC0/CC BY/CC BY-SA, credited), converted with PIL to WebP ≤1200px; push the image with the draft. No named-guide promotion.
- **SEO revision** → pick 1 page: positions 8–25 first, then positions 1–10 with many impressions and few clicks (title/description), then pages showing queries they don't answer. Skip any page edited in the last 3–4 weeks (check the change log). Prepare the edited draft in `marketing/drafts/` (URL unchanged, no deletions of useful content) and note the baseline (7-day position/impressions/clicks).
- Do **not** publish either; put both on the to-do list for approval.

## 4. Community
- TripAdvisor: Chengdu forum `ShowForum-g297463-i8702`, Sichuan `ShowForum-g297462-i8701`, China `ShowForum-g294211-i501` (scan for Chengdu/Sichuan questions). Read whole threads (page text can be blocked; strip non-ASCII via javascript if needed). Draft replies only for threads where the question is still open and recent; no links.
- Reddit: blocked for our tools. Draft replies only from screenshots/text the owner sent this week; ask for 3–5 new ones in the to-do list.
- Pinterest: 2 pins for the newest live article (title ≤100, description with hashtags + photo credit, link, image URL).

## 5. Technical SEO check
- Pages report changes, new 404s, sitemap status, broken links in articles (curl the internal and source links of recently changed pages), Core Web Vitals if the owner sent a Cloudflare screenshot. List proposed fixes; don't apply them without approval.
- Every 2 weeks: guide source links still work; any `/claim` removal/correction requests; backlink status (chengdu-expat listing) and one new link-building draft. Monthly: evaluate revisions, update the content plan. Quarterly: re-check facts in articles.

## 6. To-do list (one fixed link)
- Archive last week's file to `marketing/todo-archive/`, then update `marketing/weekly-todo.html` and publish to the same artifact URL https://claude.ai/artifact/PFiX2JkaNhbtviZb6FzHbv (Artifact tool with `url`; omit `icon`). Use a new localStorage key per week (`meetchengdu-todo-YYYY-MM-DD`). Sections: scorecard, "For your approval" (article, revision, SEO fixes), guides added this week (for information), TripAdvisor/Reddit replies with copy buttons, pins, asks (Reddit screenshots; monthly Cloudflare + Pinterest screenshots).

## 7. Wrap up and schedule
- Commit and push all files (`marketing/reports`, drafts, candidates, to-do, memory.md). Update `memory.md` (change log + a short dated note).
- CronCreate one-shot jobs (pinned dates, `recurring: false`): next Saturday 08:57 → prompt `/weekly`; this Wednesday 19:07 → prompt "MeetChengdu Wednesday reminder: read marketing/weekly-todo.html and the latest report, list (in Chinese) what is still waiting for the owner (approvals, posts, screenshots), in a short message." Check CronList first to avoid duplicates.
- Final message in Chinese: the scorecard line, guides added, what's waiting for approval, the to-do link, and the URLs whose indexing was requested.
