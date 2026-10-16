# On-site SEO audit: www.meetchengdu.com

Audit date: 2026-10-15. Method: live fetches with a Googlebot UA (curl), plus a read of `server/_core/seo.ts`, `sitemap.ts`, `vite.ts`, `index.ts`, `client/src/pages/PublicPages.tsx`, `client/src/lib/translations.ts`, `client/index.html`, `scripts/seed-data.json` and `server/db.ts`. No code or content was changed.

---

## 1. Summary

1. **Indexing basics now work.** Every public URL returns distinct server-rendered `<title>`, description, canonical and og tags, plus readable HTML. The sitemap and robots.txt are correct, and the old onrender URL 301s in one hop. The fix only shipped on 2026-10-14, so zero impressions so far is expected. The site is new and has no backlinks.
2. **Guide pages are weak search targets.** 23 of 31 guide titles and H1s are Chinese Xiaohongshu handles (`英语导游Libby | LocalMate China`, `咔嚓咔嚓 | LocalMate China`) that an English searcher will never type. The pages are thin: a median of 133 words in the server HTML, 26 of 31 under 150 words, about 35 identical boilerplate words on every page, and 4 legacy profiles at 29 to 49 words of mostly Chinese text.
3. **Soft 404s, and missing server HTML for articles and JSON-LD.** Unknown URLs and removed profiles return **200** with the home page's default title (soft 404). Blog articles serve only 23 words (title and excerpt) in HTML, because the body is rendered client-side. No JSON-LD (Person, BlogPosting, FAQPage, Organization) is in the server HTML. It only appears after JavaScript runs.

---

## 2. Prioritized fix list

| # | Fix | Why (evidence) | Impact | Effort | Files to change |
|---|-----|----------------|--------|--------|-----------------|
| 1 | Return real 404 / 410 status codes | `/guides/does-not-exist`, `/blog/nope`, `/random-page`, `/guides/Libby` and removed profiles `/guides/xu-yao` and `/guides/chengdu-english-guide-susan` all return **200** with the generic home title and no canonical (soft 404, 1,560-byte shell). Removed guides should drop out of the index cleanly (opt-out promise). | High | S | `server/_core/vite.ts` (`serveStatic`), `server/_core/seo.ts` |
| 2 | English-first guide titles, H1s and descriptions | 23/31 titles contain CJK, e.g. `成都英语导游Fiona`, `重生之我在成都当英语导游`, `麻辣大师兄`. None contain "Chengdu tour guide" in English. Two pairs are near-identical: `成都英语导游Susan` vs `成都英文导游Susan`, and `Shirley英语` vs `成都英语导游Shirley`. | High | S–M | `server/_core/seo.ts`, `PublicPages.tsx` (`GuideDetailPage`, `GuideCard`), `drizzle/schema` + seed (new `nameEn` field) |
| 3 | Server-render the full blog article body | `/blog/first-48-hours-in-chengdu` serves 23 words of HTML (h1 + excerpt). The 150–324 word body only appears after the JS bundle (464 KB brotli) runs. The articles are the only pages that can target informational queries ("first time in Chengdu", "Chengdu itinerary"). | High | S | `server/_core/seo.ts` (postMatch branch) |
| 4 | Thicken guide pages and remove repeated boilerplate | Median 133 words. Penny 29, Yanny 40, April 43, Susan 49 words, with Chinese-only `longBio` (`高级中英文导游 记录生活美好`). Susan's `shortBio` == `longBio`. Penny's description is truncated: `"A Chengdu-linked English guide "` (31 chars). Three boilerplate sentences repeat on 27–31 of the pages. | High | M | DB content / `scripts/seed-data.json`, `seo.ts` |
| 5 | Server-inject JSON-LD | `grep ld+json` = 0/31 guide pages, 0 on home/blog/about. Today it is only added in `useStructuredData()` client-side. | Med | S | `server/_core/seo.ts` |
| 6 | Server-render internal links on guide pages, and add breadcrumbs | Server HTML for guide pages has 4 nav links + 1 outbound Xiaohongshu link. It has no tags, no "Similar Chengdu guides", no "Mentioned in the journal", and no breadcrumb. Only 3 guides receive journal links (huage-harry, april, yanny), and 2 of those are among the thinnest pages. | Med | S | `server/_core/seo.ts`, `PublicPages.tsx`, article content |
| 7 | Keyword-bearing H1s and titles on hub pages | Home H1 = "Meet the city beyond the map." Blog H1 = "A quieter, more useful way to plan Chengdu." Neither says "English-speaking guide". Blog title "Chengdu journal" (33 chars) wastes space. | Med | S | `client/src/lib/translations.ts` |
| 8 | Indexable interest landing pages | 8 tags exist (pandas 23 guides, western-sichuan 16, tea-culture 6…), but `/guides?tag=pandas` canonicals to `/guides`. There is no page that can rank for "panda base English guide Chengdu". | Med | M | `App.tsx`, `PublicPages.tsx`, `seo.ts`, `sitemap.ts` |
| 9 | Image weight, dimensions, lazy loading, alt text | Avatars are 300×300 PNG, 91–134 KB each, shown at 64 px. The 31-guide directory loads about 3 MB of avatars. Covers are 196–357 KB JPEG and the hero is 271 KB (1600×800). No `width`/`height` and no `loading="lazy"` anywhere. The hero alt says "Illustrated Chengdu streetscape with teahouse details…" but the image is an Anshun Bridge photo. Avatar alt is "英语导游Libby profile". | Med | S | `client/public/guide_profile/*`, `client/public/images/*`, `PublicPages.tsx`, `translations.ts` |
| 10 | Brand / domain alignment (decision for owner) | Domain `meetchengdu.com` vs brand "LocalMate China". The 18-char suffix ` \| LocalMate China` is on every title. | Med | S (decision) / M (rename) | `seo.ts`, `index.html`, `translations.ts`, `PublicShell.tsx` |
| 11 | Cache headers for hashed assets and images | `/assets/index-*.js`, CSS, images and avatars all return `cache-control: public, max-age=0`. | Low | S | `server/_core/vite.ts` |
| 12 | Code-split admin routes | One 1.51 MB JS bundle (464 KB br) includes all `/admin/*` pages and is loaded by every visitor. | Low | S | `client/src/App.tsx` |
| 13 | Trim over-long descriptions | 7 guide descriptions are >155 chars (libby 171, melody 177, holly 168, shirley 168, tommy 167, mala-big-bro 158, hanfu 158). Google will truncate them. | Low | S | DB content |
| 14 | Sitemap lastmod on static pages | `/`, `/guides`, `/blog`, `/about` have no `<lastmod>`. | Low | S | `server/_core/sitemap.ts` |
| 15 | Collapse the 2-hop apex redirect | `http://meetchengdu.com/x` → `https://meetchengdu.com/x` → `https://www.meetchengdu.com/x` (2 hops). Harmless, but one hop is cleaner. | Low | S | Cloudflare redirect rule |
| 16 | Unrendered-text flash / hydration mismatch | The server body is unstyled plain HTML that React replaces. Home server HTML lists all 31 guides, while the rendered home shows 4 featured guides. That is acceptable (same intent, not cloaking), but keep the server summary a faithful subset of the rendered page. | Low | — | `seo.ts` |

### Change sketches (High / Med items)

**#1: Real 404/410 status (High)**
> 中文：不存在的网址和已移除的导游页目前返回 200 + 首页标题，属于“软 404”，应返回 404/410。

`renderPageHtml` already returns the untouched template when `resolvePage` returns `null`. Make it return a status as well, and have `serveStatic` (and `setupVite`) use it:
```ts
// seo.ts
const KNOWN_SPA = /^\/(admin(\/.*)?|claim)?$/;   // routes that are fine without server meta
export async function renderPageHtml(template, pathname) {
  const meta = await resolvePage(pathname)...;
  if (!meta) {
    const removed = await isRemovedSlug(pathname);           // getGuideBySlug(slug, {includeRemoved:true}).status === "removed"
    const status = KNOWN_SPA.test(pathname) ? 200 : removed ? 410 : 404;
    const html = status === 200 ? template
      : setTag(template, /<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex" />');
    return { html, status };
  }
  ...
  return { html, status: 200 };
}
// vite.ts serveStatic
const { html, status } = await renderPageHtml(template, req.baseUrl || "/");
res.status(status).set({ "Content-Type": "text/html" }).end(html);
```
Also add `noindex` for `/admin*` (robots.txt blocks crawling but not indexing of linked URLs). Optionally 301 case variants such as `/guides/Libby` → `/guides/libby`. In the client, `GuideDetailPage` and `BlogArticlePage` should set `<meta name="robots" content="noindex">` when rendering the not-found `ErrorPanel`.

**#2: English-first guide titles (High)**
> 中文：23/31 个导游页标题是中文小红书昵称（如“英语导游Libby”），英文用户不会搜索这些词。建议标题改为“Libby – English-Speaking Tour Guide in Chengdu”。

Using a Chinese handle as the whole title is bad for English search. It carries no query terms ("English-speaking", "tour guide", "Chengdu"), and some handles contain no Latin name at all (`咔嚓咔嚓`, `麻辣大师兄`, `重生之我在成都当英语导游`). Keep the handle on the page as "Xiaohongshu name: 英语导游Libby", which helps the rare searcher who has seen it on Xiaohongshu, but lead with an English name.
- Add `nameEn` (varchar, nullable) to `guides`. Fill it by hand: Libby, Tommy, Susan (Chengdu Susan, for chengdu-susan), Shirley, Kacha Kacha, "Mala Big Bro", Xiao O, Xiaoyu, Tangchao'er, "Hanfu Guide" and so on. Fall back to the slug title-cased.
- Title pattern, kept under about 60 chars: **`{nameEn} – English-Speaking Tour Guide in Chengdu`**, with the suffix shortened or dropped when it would exceed 60. Example: `Libby – English-Speaking Tour Guide in Chengdu | LocalMate` (58). When a guide has a strong specialty, use it instead: `Betty – Panda Base English Guide, Chengdu`, `Nick – Dujiangyan English Tour Guide`.
- H1 = `{nameEn}`, with a sub-line `English-speaking guide in {city} · Xiaohongshu: {displayName}`.
- Disambiguate the pairs with specialties: `susan` vs `chengdu-susan`, and `shirley` vs `chengdu-shirley`.
- Apply the same `guideTitle(guide)` helper in both `seo.ts` (server) and `usePageMeta` (client) so they never disagree.

**#3: Server-render the full article body (High)**
> 中文：博客文章的服务器 HTML 只有 23 个词（标题+摘要），正文完全依赖 JS 渲染。应在服务器端输出完整正文。

In `seo.ts` `postMatch`, render `post.bodyMarkdown` to HTML (`marked` is small; or reuse whatever Streamdown uses), and append links to `relatedGuides` and a `datePublished` line:
```ts
body: page(post.title, post.excerpt ?? "", `${marked.parse(post.bodyMarkdown)}<h2>Guides mentioned</h2><ul>${related.map(g=>`<li>${link(`/guides/${g.slug}`, guideTitle(g))}</li>`).join("")}</ul>`),
```
`getBlogPostBySlug` already returns `relatedGuides`. Separately, the articles are short (150, 233 and 324 words), which is thin for competitive queries like "Chengdu 48 hours". Content expansion is tracked in `marketing/content-plan.md`.

**#4: Thicker, de-duplicated guide content (High)**
> 中文：导游页正文太薄（中位数 133 词），且每页约 35 个词的免责声明完全相同；4 个旧档案（Penny/Yanny/April/Susan）只有 29–49 个词且多为中文。

- Rewrite the 4 legacy profiles (penny, yanny, april, susan) to the same English format as the newer ones (about 80–120 words of English evidence). Fix Penny's truncated `shortBio`, and stop duplicating Susan's `shortBio` into `longBio`.
- Move "This profile is editorially compiled from public sources and has not been claimed. Ask the guide directly about…" **out of `longBio`** and render it once, from code, as a small disclaimer. It is then template text, not body text.
- Add structured, unique, useful facts the data already implies, rendered as a short "At a glance" list: languages, areas covered (from tags: Panda Base, Leshan, Dujiangyan…), the claim status, and the last-reviewed date. Aim for 200+ unique words per page over time. This is the main lever for guide-page rankings, so the effort is worth spending.

**#5: Server-side JSON-LD (Med)**
Build the same objects that `useStructuredData` builds, in `resolvePage`, and inject `<script type="application/ld+json">` before `</head>` (escape `<` as `<`):
- `/`: `WebSite` (name, url) + `Organization` (name, url, logo).
- `/guides`: `CollectionPage` with an `ItemList` of guide URLs.
- `/guides/:slug`: `ProfilePage` with `mainEntity: Person` (name = nameEn, alternateName = displayName, `knowsLanguage`, `address.addressLocality`, image, `sameAs` = Xiaohongshu profile URL) + `BreadcrumbList`.
- `/blog/:slug`: `BlogPosting` (headline, image, datePublished, dateModified, author) + `BreadcrumbList`.
- `/about`: FAQPage is fine to keep, but Google only shows FAQ rich results for authoritative government and health sites, so expect no visual benefit.
Keep the client hook so SPA navigations stay correct.

**#6: Internal links and breadcrumbs in the server HTML (Med)**
In the guide branch of `resolvePage`, also output the tags, `similarGuides` (3 links) and `relatedArticles`, which `getGuideBySlug` already returns. Add a breadcrumb line `Home › Chengdu guides › Libby` to both the server HTML and the React page (with `BreadcrumbList` JSON-LD). In the content itself, link the journal articles to the strongest profiles (betty, libby, chengdu-susan, tommy, mala-big-bro), not only harry, april and yanny.

**#7: Hub-page H1s and titles (Med)**
In `translations.ts`, change these:
- `home.title` → keep the poetic line as an eyebrow, and make the H1 something like "English-speaking local guides in Chengdu".
- `blog.metaTitle` → "Chengdu Travel Tips & Itineraries" (or similar). `blog.title` → include "Chengdu travel".
- `directory.metaTitle` → "English-Speaking Tour Guides in Chengdu – Directory" (about 50).
- `about.metaTitle` "About our methodology" is fine (not a search target).

**#8: Interest landing pages (Med)**
Turn the 4–5 strongest tags into real routes: `/guides/pandas` (pick a pattern that does not collide with guide slugs, e.g. `/chengdu/panda-base-guides`), `/western-sichuan-guides` and `/tea-culture-guides`. Each gets a self-canonical, about 150 words of unique intro, a filtered guide list, an entry in `seo.ts` and a sitemap entry. These pages target the queries real travelers use ("English guide Chengdu Panda Base", "Leshan Giant Buddha private guide English").

**#9: Images (Med)**
- Re-encode avatars to 160×160 WebP (about 8–15 KB each, versus 91–134 KB PNG now). Re-encode covers and the hero to WebP at about 1200–1600 px wide, around 100 KB.
- Add `width`/`height` (or aspect-ratio boxes) and `loading="lazy" decoding="async"` to avatar and article-card images. Leave the hero eager, with `fetchpriority="high"`.
- Fix `home.heroAlt` to describe the actual photo: "Anshun Bridge over the Jin River in Chengdu at dusk".
- Avatar alt: use `${nameEn}, English-speaking guide in Chengdu`. Article cover alt = title is acceptable.

**#10: Brand vs domain (Med, owner decision; no recommendation forced)**
- Today the title suffix, og:site_name, Organization name and copy all say "LocalMate China", while the URL says meetchengdu. Users who see `meetchengdu.com` in results next to "LocalMate China" may hesitate. Google may also pick either string as the displayed site name.
- Option A: keep "LocalMate China" as the brand, and add `WebSite` JSON-LD with `name: "LocalMate China"` and `alternateName: "Meet Chengdu"`.
- Option B: rebrand the visible name to "Meet Chengdu" (or "MeetChengdu"). It matches the domain, is shorter (saves about 6 title chars) and contains "Chengdu", a keyword. It loses "China" breadth if you later expand cities.
- Either way, make one name consistent in the title suffix, og:site_name, the logo text and the JSON-LD. Decide before backlinks accumulate around one name.

---

## 3. Things that are fine

- **Server-injected meta works.** Every valid public URL has a unique `<title>`, meta description, self-referencing absolute canonical on `https://www.meetchengdu.com`, og:title/description/url/image (absolute URLs) and `og:type=article` on posts.
- **One `<h1>` per page** in the server HTML on every page checked, and in the React pages as well.
- **Canonicals handle variants.** `/guides/libby/` and `/guides/libby?x=1` both canonicalize to `/guides/libby`, and `?tag=` / `?guide=` parameters canonicalize to the clean path.
- **Redirects.** `localmate-chengdu.onrender.com/*` → www is a single 301 that preserves the path. `meetchengdu.com` → www is also a single 301.
- **robots.txt** allows everything except `/admin` and `/api/`, and points to the correct sitemap.
- **Sitemap** lists all 31 public guides and the 3 published posts, excludes removed guides (xu-yao, chengdu-english-guide-susan/penny) and the archived post, uses the www host, and its lastmod values come from `updatedAt` (real dates, not "now").
- **TTFB is fine:** 0.16 s for pages without DB lookups, about 0.44 s for guide and article pages (Cloudflare in front, brotli on). HTML is tiny (2–8 KB).
- **No hreflang is needed.** The EN/ZH toggle is client-only (localStorage, same URL, `<html lang="en">` server-side), so Google only sees English. That is correct for the audience. Only add `/zh/…` URLs with hreflang if you later want to rank in Chinese search, which is not the goal.
- **The directory renders up to 48 guides client-side** and the server HTML for the home and `/guides` pages links all 31, so no guide page is orphaned.
- **Fonts:** Google Fonts with `display=swap` and preconnect. The stylesheet is render-blocking, but that is acceptable at this scale. Trimming Manrope from 5 weights to 3 is an optional small win.
- **Zero impressions is not a bug yet.** The real HTML has only been live since 2026-10-14. In Search Console, submit the sitemap and request indexing for `/`, `/guides`, the 3 posts and the 5–10 strongest profiles. Backlinks (Reddit/TripAdvisor answers, travel forums, guide self-shares) will matter more than any item above.

---

## 4. Raw evidence appendix (trimmed)

**Status / timing (Googlebot UA, 2026-10-15)**
```
/                               code=200 ttfb=0.358s size=8200
/guides                         code=200 ttfb=0.396s size=8194
/guides/libby                   code=200 ttfb=0.438s size=3284
/guides/tommy                   code=200 ttfb=0.456s size=3203
/guides/chengdu-susan           code=200 ttfb=0.459s size=3621
/blog                           code=200 ttfb=0.336s size=2730
/blog/first-48-hours-in-chengdu code=200 ttfb=0.459s size=2148
/about                          code=200 ttfb=0.161s size=2778
/claim                          code=200 ttfb=0.188s size=2020
/guides/does-not-exist          code=200 size=1560   <- soft 404 (generic home title)
/blog/nope                      code=200 size=1560   <- soft 404
/random-page                    code=200 size=1560   <- soft 404
/guides/Libby                   code=200 size=1560   <- soft 404 (case)
/guides/xu-yao (removed)        code=200 <title>LocalMate China — Chengdu guide discovery</title>
/guides/chengdu-english-guide-susan (removed) code=200 same generic title
/blog/how-we-review-public-guide-profiles (archived) code=200 same generic title
/admin                          code=200 same generic title
```

**Redirects**
```
https://localmate-chengdu.onrender.com/guides/libby -> 301 https://www.meetchengdu.com/guides/libby (1 hop)
https://meetchengdu.com/                            -> 301 https://www.meetchengdu.com/ (1 hop)
http://meetchengdu.com/guides/libby -> 301 https://meetchengdu.com/guides/libby -> 301 https://www... (2 hops)
```

**/guides/libby server HTML (head + root)**
```html
<title>英语导游Libby | LocalMate China</title>
<meta name="description" content="An English-major, licensed English guide with four years of experience receiving foreign visitors in Chengdu, known for panda, red-panda and Sichuan cooking-class outings." />   (171 chars)
<meta property="og:image" content="https://www.meetchengdu.com/guide_profile/Libby.png" />
<meta property="og:url" content="https://www.meetchengdu.com/guides/libby" />
<link rel="canonical" href="https://www.meetchengdu.com/guides/libby" />
<div id="root"><nav>Home · Guide directory · Journal · Methodology</nav><main><h1>英语导游Libby</h1>
<p>An English-major, licensed English guide …</p><p>Libby's public Xiaohongshu profile lists … This profile is editorially
compiled from public sources and has not been claimed. Ask the guide directly about current availability, credentials,
pricing, insurance, and exact service scope before making plans.</p><h2>Public sources</h2><ul><li><a href="https://www.xiaohongshu.com/user/profile/…">英语导游Libby — Xiaohongshu profile</a></li></ul>
<p>LocalMate China does not employ or vouch for this guide. …</p></main></div>
(no application/ld+json, no tags, no similar guides, no related articles)
```

**Thinnest guide pages (server HTML `<main>`)**
```
penny (29 words):  <h1>成都英语导游Penny</h1><p>A Chengdu-linked English guide </p><p>高级中英文导游 记录生活美好</p>…
yanny (40 words):  <h1>四川中级英文导游yanny</h1><p>An English-major guide who wrote about …</p><p>四川中级中英文导游</p>…  source link text "Public source"
april (43 words):  <p>✨18岁考取英语导游证 🌍人类学与世界民族硕士在读 🌈Do whatever you want !</p>
susan (49 words):  shortBio and longBio identical: "10年资深英语导游 带团足迹遍布全球50多个国家 10 years experience of guiding foreign groups Local guide in Chengdu"
```

**All 31 guide pages (title length / description length / words in server `<main>`)**
```
CJK in title: 23/31   title>60: 0   desc>155: 7   desc<70: 1 (penny, 31)   JSON-LD: 0/31
words: min 29, median 133, max 168; 26/31 under 150
Repeated sentences across guide pages:
  31x "Any arrangement is solely between you and them."
  27x "This profile is editorially compiled from public sources and has not been claimed."
  27x "Ask the guide directly about current availability, credentials, pricing, insurance, and exact service scope before making plans."
Sample titles: 咔嚓咔嚓 | LocalMate China · 麻辣大师兄 | LocalMate China · 重生之我在成都当英语导游 | LocalMate China ·
  小鱼🐟带外国人看中国的日常 | LocalMate China · 成都英语导游Susan vs 成都英文导游Susan · Shirley英语 vs 成都英语导游Shirley
```

**Hub pages**
```
/       title(58) "English-speaking local guides in Chengdu | LocalMate China"  h1 "Meet the city beyond the map."  675 words, 31 guide links
/guides title(41) "Chengdu guide directory | LocalMate China"                   h1 "Find a Chengdu local guide"      685 words
/blog   title(33) "Chengdu journal | LocalMate China"                          h1 "A quieter, more useful way to plan Chengdu."  3 article links
/blog/first-48-hours-in-chengdu title(48)  23 words in HTML (h1 + excerpt only), 0 links
/about  title(39) 138 words   /claim title(53) 19 words
```

**robots.txt**
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://www.meetchengdu.com/sitemap.xml
```

**sitemap.xml (excerpt)**: 4 static URLs (no lastmod), 31 guides, 3 posts
```xml
<url><loc>https://www.meetchengdu.com/</loc></url>
<url><loc>https://www.meetchengdu.com/guides/huage-harry</loc><lastmod>2026-07-22T04:31:47.000Z</lastmod></url>
<url><loc>https://www.meetchengdu.com/guides/libby</loc><lastmod>2026-10-10T17:04:05.000Z</lastmod></url>
<url><loc>https://www.meetchengdu.com/blog/after-sunset-fun-in-chengdu</loc><lastmod>2026-07-22T04:31:55.000Z</lastmod></url>
```

**Assets**
```
/images/chengdu-hero-anshun-bridge.jpg   271,046 B  1600x800  cache-control: public, max-age=0
/images/cover-first-48-hours-panda.jpg   196,324 B
/images/cover-tea-food-neighborhoods.jpg 357,042 B
/images/cover-after-sunset-night.jpg     337,865 B
/guide_profile/Libby.png                 133,654 B  300x300 (displayed at 64px / 112–144px)
/guide_profile/Tommy.png                  91,160 B
/guide_profile/SusanV.png                 94,511 B
client/public/guide_profile/ total       3.2 MB (31 files)
/assets/index-nujNPli4.js  1,512,404 B raw / 463,899 B brotli (includes admin pages), max-age=0
/assets/index-CVV534zO.css   162,372 B raw, max-age=0
HTML: content-encoding br, server cloudflare, cf-cache-status DYNAMIC
```
