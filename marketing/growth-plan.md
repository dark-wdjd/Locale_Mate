# MeetChengdu growth plan: from 0 to steady daily traffic

_Written 2026-11-01. Goal: steady daily visitors and first-page Google results for the brand name and long-tail searches, **before** reaching out to guides._

## Where we are (2026-11-01)
- About 39 URLs in the sitemap. Indexing was blocked by a rendering bug until 2026-10-29 (now fixed); many pages are still "Discovered – not indexed".
- Search Console: about 10 impressions a week, 0 clicks. The search "Meet Chengdu" shows the site around page 10–11 (Google reads the phrase as "meet people in Chengdu"; the site name changed on 2026-10-18).
- 6 articles (3 practical guides published in the last two weeks); 31 guide profiles with English titles since 2026-10-31.
- No backlinks, and no social or community presence apart from the owner's TripAdvisor profile.

## Targets
| By | Target | How we measure |
|---|---|---|
| 2026-11-15 | Most of the 39 pages indexed | Search Console → Pages → "Indexed" |
| 2026-11-30 | "meetchengdu" and "Meet Chengdu" on page 1 | Search Console → Performance → Queries (position < 10) |
| 2026-12-31 | 300+ Google impressions a week; 10+ visitors a day from all sources | Search Console + Cloudflare Web Analytics |
| When reached | **About 300 visitors a month → start contacting guides** | Cloudflare (monthly visitors) |

## The 6 things that matter most, in order

### 1. Get every page indexed (week 1–2) — *biggest quick win*
Pages that aren't indexed can't get impressions.
- **Owner:** request indexing for about 10 URLs a day (list given in chat 2026-10-31), then once for each new article.
- **Owner:** upgrade Render to **Starter ($7/mo)**. No sleeping and no free-hour suspensions, so Google can crawl more often.
- **Claude:** watch the Pages report weekly and fix anything new that it flags.

### 2. Make "MeetChengdu" a recognisable brand (week 1–4) — *fixes the page-10 brand search*
Google learns a brand from consistent mentions of the same name plus a link on other sites.
- **Owner creates profiles named "MeetChengdu", each linking to https://www.meetchengdu.com:**
  - Reddit community **r/MeetChengdu** (plan in `marketing/reddit/plan.md`)
  - **Pinterest** business account. Travel content does very well there, and every pin links back.
  - **Instagram** or **Facebook page** (pick one and post weekly)
  - **Xiaohongshu** account "MeetChengdu" (for later guide outreach; guides live there)
- **Claude:** writes bios and first posts for each profile; adds the profile links to the site footer and the Organization `sameAs` structured data (a strong brand signal).

### 3. Publish one long-tail article a week (ongoing) — *the main long-term traffic engine*
Each good article adds a new way into the site. Target specific searches with little competition.
- **Claude:** research, drafting, photos and publishing. **Owner:** reviews within 1–2 days.
- Order: guide prices and quotes → Leshan day trip → Chengdu→Jiuzhaigou by train → Dujiangyan → teahouses and mahjong → Chengdu 3-day itinerary → getting around Chengdu as a foreigner (payments, DiDi, metro).
- Every article links to 2–3 related articles and the guide directory.

### 4. Earn links and mentions from other sites (ongoing, about 1 h/week) — *what makes Google trust the site*
- **Owner:** 2–3 genuinely helpful answers a week on TripAdvisor and Reddit (r/chengdu, r/chinatravel). Links only when someone directly asks, always with a disclosure.
- **Owner:** submit the site to free, legitimate listings: chengdu-expat.com "Add Place", plus any China-travel resource lists that accept submissions.
- **Claude:** finds 5–10 China-travel bloggers and resource pages that might link to the Panda Base and Sanxingdui guides, and drafts short, honest emails for the owner to send.
- Claude also sets up a free **Ahrefs Webmaster Tools** account check (owner verifies) to see who links to us.

### 5. Turn content into Reddit and Pinterest traffic (from week 2) — *visitors that don't depend on Google*
- **Claude:** rewrites each article as a complete Reddit post for r/MeetChengdu, plus 2–3 Pinterest pin descriptions per article.
- **Owner:** posts them (Claude can't post on the owner's behalf).

### 6. Measure weekly, adjust monthly (15 min/week)
- **Owner, every Monday:** screenshot Search Console (Performance + Pages) and Cloudflare (visitors, referrers).
- **Claude:** reads them, reports what's working, and picks the next article accordingly.

## This week (2026-11-01 → 11-08)
| Who | Task |
|---|---|
| Owner | Request indexing: day 1–4 lists (about 10 a day) |
| Owner | Upgrade Render to Starter |
| Owner | Create r/MeetChengdu + Pinterest business account (both named MeetChengdu, linking to the site) |
| Claude | Write the Reddit welcome post + first 2 posts, Pinterest bio + first pins (ready to paste) |
| Claude | Add footer social links + `sameAs` once the profiles exist |
| Claude | Draft the next article: "What does an English-speaking guide in Chengdu cost?" |

## Later: guide outreach (when about 300 visitors a month)
Use the traffic numbers as the pitch: "your profile on MeetChengdu was viewed X times this month". Add a "guides: get listed / claim your profile" page before starting.
