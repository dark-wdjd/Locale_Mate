import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const tags = [
  ["english", "English", "language", "Public evidence indicates English-language guiding or interpretation experience."],
  ["pandas", "Pandas", "interest", "Public content references Chengdu panda visits or guiding."],
  ["tea-culture", "Tea culture", "interest", "Public content references teahouses, parks, or Chengdu tea culture."],
  ["sichuan-opera", "Sichuan opera", "interest", "Public content references Sichuan opera, face-changing, or local performance culture."],
  ["city-classics", "City classics", "route", "Suitable evidence for classic Chengdu city sights and neighborhoods."],
  ["western-sichuan", "Western Sichuan", "route", "Public evidence also references western Sichuan or Jiuzhaigou trips."],
  ["private-tour", "Private tours", "style", "Public evidence describes small-group or private guiding."],
  ["first-time-visitors", "First-time visitors", "audience", "A useful starting point for first-time Chengdu trip planning."],
];

for (const [slug, name, category, description] of tags) {
  await connection.execute(
    `INSERT INTO tags (slug, name, category, description)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), description = VALUES(description)`,
    [slug, name, category, description],
  );
}

const guides = [
  {
    slug: "huage-harry",
    displayName: "Huage Harry",
    shortBio: "An English-language guide whose public videos connect Chengdu, Sichuan culture, panda visits, parks, and Sichuan opera.",
    longBio: "Publicly indexed videos show Huage Harry presenting English-guiding content around Sichuan cultural experiences. One verified Douyin video is framed around Sichuan opera, including face-changing and fire-spitting; other indexed content references hosting Australian visitors in Chengdu. This profile is editorially compiled from public sources and has not been claimed. Ask the guide directly about current availability, credentials, pricing, insurance, and exact service scope before making plans.",
    status: "unclaimed",
    featured: true,
    editorsPick: true,
    tags: ["english", "pandas", "sichuan-opera", "city-classics", "first-time-visitors"],
    sources: [
      ["douyin", "post", "https://www.douyin.com/video/7605139238754171385", "Sichuan opera: face-changing and local performance", "Verified public video associated with English-guide and Sichuan-culture tags.", true],
    ],
  },
  {
    slug: "luo-shijia",
    displayName: "Luo Shijia",
    shortBio: "A Chengdu-based English guide profiled by Tencent News for guiding international visitors through Chengdu and western Sichuan.",
    longBio: "Tencent News reports that Luo Shijia studied tourism English, holds a guide credential, and began working in the industry in 2018. The report describes trips with international visitors to places including the Chengdu Research Base of Giant Panda Breeding, People's Park, Kuanzhai Alley, Wenshu Monastery, and Jiuzhaigou. Her Xiaohongshu post title was publicly reported, but an independently verified profile URL was not available at the time of review. This listing is unclaimed; verify identity, availability, credentials, pricing, and itinerary details directly on the platform.",
    status: "unclaimed",
    featured: true,
    editorsPick: true,
    tags: ["english", "pandas", "tea-culture", "city-classics", "western-sichuan", "private-tour"],
    sources: [
      ["xiaohongshu", "search", "https://www.xiaohongshu.com/search_result?keyword=%E9%87%8D%E7%94%9F%E4%B9%8B%E6%88%91%E5%9C%A8%E6%88%90%E9%83%BD%E5%BD%93%E8%8B%B1%E8%AF%AD%E5%AF%BC%E6%B8%B8", "Search: Reborn as an English guide in Chengdu", "Platform search for the exact publicly reported post title; confirm the account before contacting.", true],
      ["media", "article", "https://news.qq.com/rain/a/20250225A044N900", "Tencent News profile of English guides", "Independent media coverage describing Luo Shijia's background and Chengdu guiding experience.", false],
    ],
  },
  {
    slug: "xu-yao",
    displayName: "Xu Yao",
    shortBio: "An English guide reported to publish English tour commentary and to guide visitors in Chengdu, Jiuzhaigou, and western Sichuan.",
    longBio: "Tencent News reports that Xu Yao began English-guiding work in 2024 after experience in overseas hotel management and travel services. The article says she publishes English explanations on Xiaohongshu and has guided visitors from several countries in Chengdu and western Sichuan. A verified public account URL was not available during review, so the link below is a search route rather than a confirmed profile. This listing is unclaimed; confirm the account and all service details before contacting.",
    status: "unclaimed",
    featured: true,
    editorsPick: false,
    tags: ["english", "city-classics", "western-sichuan", "private-tour"],
    sources: [
      ["xiaohongshu", "search", "https://www.xiaohongshu.com/search_result?keyword=%E5%BE%90%E7%91%B6%20%E6%88%90%E9%83%BD%20%E8%8B%B1%E8%AF%AD%E5%AF%BC%E6%B8%B8", "Search: Xu Yao Chengdu English guide", "Search route only; confirm the creator's identity and current professional status.", true],
      ["media", "article", "https://news.qq.com/rain/a/20250225A044N900", "Tencent News profile of English guides", "Independent media coverage describing Xu Yao's background and service locations.", false],
    ],
  },
  {
    slug: "feng-yan",
    displayName: "Feng Yan",
    shortBio: "An English-major guide who wrote about hosting one- and two-person foreign-language tours around Chengdu's classic sights.",
    longBio: "In a first-person article published by People's Daily Overseas Edition, Feng Yan describes studying English at Sichuan Normal University and guiding small foreign-language groups in Chengdu. The article references Kuanzhai Alley, teahouses, and panda-related visits. A possible Xiaohongshu profile was found but could not be independently attributed, so LocalMate China does not present it as a verified personal account. This listing is unclaimed; use the evidence article and platform search to verify identity and availability.",
    status: "unclaimed",
    featured: false,
    editorsPick: true,
    tags: ["english", "pandas", "tea-culture", "city-classics", "private-tour"],
    sources: [
      ["media", "article", "https://paper.people.com.cn/rmrbhwb/pc/content/202508/04/content_30092780.html", "People's Daily Overseas Edition: I guide foreign visitors around China", "First-person published account describing Chengdu guiding work and background.", true],
      ["xiaohongshu", "search", "https://www.xiaohongshu.com/search_result?keyword=%E5%86%AF%E7%87%95%20%E6%88%91%E5%B8%A6%E8%80%81%E5%A4%96%E6%B8%B8%E4%B8%AD%E5%9B%BD%20%E6%88%90%E9%83%BD%E5%9C%B0%E9%99%AA", "Search: Feng Yan Chengdu local guide", "Search route only; no profile attribution is claimed.", false],
    ],
  },
  {
    slug: "cecilia-wei",
    displayName: "Cecilia (Wei)",
    shortBio: "A Chengdu-linked English guide lead found through a public Douyin search result; the original profile still requires confirmation.",
    longBio: "A public Douyin search snippet contains an English-guide self-introduction using the name Cecilia, or Wei, and a Chengdu reference. LocalMate China has not independently located the original video or confirmed a personal profile URL. This is therefore a lower-confidence, unclaimed lead rather than a verified recommendation. Confirm the creator's identity, professional status, credentials, availability, route, and pricing before any contact or booking discussion.",
    status: "unclaimed",
    featured: false,
    editorsPick: false,
    tags: ["english", "city-classics"],
    sources: [
      ["douyin", "search", "https://www.douyin.com/search/%E8%8B%B1%E6%96%87%E5%AF%BC%E6%B8%B8%E8%87%AA%E6%88%91%E4%BB%8B%E7%BB%8D%E5%BC%80%E5%9C%BA%E7%99%BD%E4%B8%80%E5%88%86%E9%92%9F", "Search: English guide self-introduction", "Search route only; locate the Cecilia/Wei video and verify the profile before contact.", true],
    ],
  },
  {
    slug: "chengdu-english-guide-susan",
    displayName: "Chengdu English Guide Susan",
    shortBio: "An English-speaking Chengdu guide with a verified public Xiaohongshu profile reviewed by LocalMate China.",
    longBio: "This profile is editorially compiled from Susan's public Xiaohongshu presence, which connects her with English-language guiding in Chengdu. The profile is unclaimed. Ask the guide directly about current availability, credentials, pricing, insurance, and exact service scope before making plans.",
    status: "unclaimed",
    featured: false,
    editorsPick: false,
    tags: ["english"],
    sources: [
      ["xiaohongshu", "profile", "https://www.xiaohongshu.com/user/profile/5ed4f2a1000000000101d629", "Xiaohongshu public profile", "Verified public profile associated with English-language guiding in Chengdu.", true],
    ],
  },
  {
    slug: "chengdu-english-guide-penny",
    displayName: "Chengdu English Guide Penny",
    shortBio: "An English-speaking Chengdu guide with a public Xiaohongshu profile reviewed by LocalMate China.",
    longBio: "This profile is editorially compiled from Penny's public Xiaohongshu presence, which connects her with English-language guiding in Chengdu. The profile is unclaimed. Ask the guide directly about current availability, credentials, pricing, insurance, and exact service scope before making plans.",
    status: "unclaimed",
    featured: false,
    editorsPick: false,
    tags: ["english"],
    sources: [],
  },
];

for (const guide of guides) {
  await connection.execute(
    `INSERT INTO guides
      (slug, displayName, shortBio, longBio, city, languages, status, isClaimed, isFeatured, isEditorsPick, lastVerifiedAt)
     VALUES (?, ?, ?, ?, 'Chengdu', 'English, Mandarin', ?, 0, ?, ?, '2026-07-12 12:00:00')
     ON DUPLICATE KEY UPDATE displayName = VALUES(displayName), shortBio = VALUES(shortBio), longBio = VALUES(longBio),
       status = VALUES(status), isFeatured = VALUES(isFeatured), isEditorsPick = VALUES(isEditorsPick), lastVerifiedAt = VALUES(lastVerifiedAt)`,
    [guide.slug, guide.displayName, guide.shortBio, guide.longBio, guide.status, guide.featured, guide.editorsPick],
  );
  const [[guideRow]] = await connection.execute("SELECT id FROM guides WHERE slug = ?", [guide.slug]);
  await connection.execute("DELETE FROM guide_tag_links WHERE guideId = ?", [guideRow.id]);
  for (const tagSlug of guide.tags) {
    const [[tagRow]] = await connection.execute("SELECT id FROM tags WHERE slug = ?", [tagSlug]);
    await connection.execute("INSERT INTO guide_tag_links (guideId, tagId) VALUES (?, ?)", [guideRow.id, tagRow.id]);
  }
  await connection.execute("DELETE FROM guide_sources WHERE guideId = ?", [guideRow.id]);
  for (const source of guide.sources) {
    await connection.execute(
      `INSERT INTO guide_sources
        (guideId, platform, sourceType, url, publicTitle, evidenceSummary, isPrimary, verifiedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, '2026-07-12 12:00:00')`,
      [guideRow.id, ...source],
    );
  }
}

const articles = [
  {
    slug: "after-sunset-fun-in-chengdu",
    title: "After sunset fun in Chengdu",
    excerpt: "An external interactive 3D map for exploring Chengdu after dark—bar-crawl, KTV, and dance routes through Jinjiang District.",
    cover: "/images/cover-after-sunset-night.jpg",
    category: "Nightlife",
    minutes: 2,
    featured: false,
    status: "published",
    sortOrder: 100,
    publishedAt: "2026-07-18 00:08:57",
    body: `## An interactive map for Chengdu nights

[After Sunset in Chengdu](https://after-sunset.netlify.app) is an external interactive resource for planning an evening in the city. It presents Chengdu's night scene on a 3D map you can rotate, zoom, and explore venue by venue.

## What you'll find there

- **Bar crawl** — a curated six-stop classic cocktail route through Jinjiang District
- **KTV** — karaoke venues for a group night out
- **Dance** — clubs for later in the evening

The map includes practical touches such as ride suggestions between stops and a "must try" shortlist.

## Before you go

This is an independent external resource; LocalMate China does not operate the venues or the map. As with any night out in an unfamiliar city, confirm opening hours and prices directly, keep venue addresses in Chinese for taxi rides, and arrange your return trip in advance.

> Explore the map at [after-sunset.netlify.app](https://after-sunset.netlify.app).`,
    guides: [],
  },
  {
    slug: "first-48-hours-in-chengdu",
    title: "Your First 48 Hours in Chengdu",
    excerpt: "A calm, first-timer-friendly route through pandas, teahouses, old lanes, and the everyday rhythm that makes Chengdu memorable.",
    cover: "/images/cover-first-48-hours-panda.jpg",
    category: "Trip planning",
    minutes: 7,
    featured: true,
    body: `## Start with pace, not a checklist

Chengdu rewards a slower rhythm. For a first visit, choose **one anchor experience per half-day** and leave space for tea, food, and unplanned neighborhood walks. Your first 48 hours should help you understand the city rather than race across it.

## Day one: pandas, parks, and a relaxed evening

Begin early if the panda base is important to you. Conditions, opening arrangements, and transport details can change, so check the venue's current official information before leaving. Later, return to the city for a park or teahouse. People's Park is frequently included in public accounts of English-language Chengdu tours, but the real value is the contrast between a major attraction and ordinary city life.

For the evening, keep the plan flexible. A Sichuan opera performance can add cultural context, while a neighborhood dinner gives you time to ask practical questions about spice levels and local dishes.

## Day two: historic Chengdu and a guide-led theme

Choose a compact group of city sights rather than crossing Chengdu repeatedly. Kuanzhai Alley and Wenshu Monastery are commonly referenced in the public guiding sources reviewed by LocalMate China. Pair them with one theme that matters to you: food, tea culture, architecture, photography, or contemporary city life.

## When a local English guide helps most

A guide is most useful when you want interpretation, not just transport. Before committing, ask about the exact meeting point, duration, route, language level, credentials where relevant, included costs, cancellation terms, and how payment is handled. LocalMate China does not process bookings; contact happens on the linked source platform.

> Every guide profile on this site is compiled from public evidence and may be unclaimed. Verify identity and current service details directly before making arrangements.

## Practical final check

Keep venue addresses in Chinese, allow extra transfer time, and avoid building a day around too many distant districts. A good Chengdu introduction should leave you curious, not exhausted.`,
    guides: ["huage-harry", "luo-shijia", "feng-yan"],
  },
  {
    slug: "how-we-review-public-guide-profiles",
    title: "How LocalMate China Reviews Public Guide Profiles",
    excerpt: "Our evidence ladder, confidence language, correction process, and rules for keeping unclaimed profiles useful without overstating certainty.",
    cover: null,
    category: "Methodology",
    minutes: 6,
    featured: false,
    status: "archived",
    body: `## A directory, not a booking marketplace

LocalMate China helps English-speaking travelers discover public evidence about potential local guides. We do not take payment, promise availability, or present unclaimed profiles as endorsements.

## Our evidence ladder

We prefer a direct public post or profile that clearly connects a person with English-language guiding in Chengdu. Independent media coverage can strengthen a profile when it names the person and describes relevant experience. A platform search result without a confirmed profile is treated as a lead and labeled accordingly.

We do **not** copy private contact details, infer personal information, reproduce customer comments as testimonials, or invent ratings. Search snippets that cannot be reliably attributed are not presented as confirmed facts.

## Confidence is expressed in words

A profile may include strong, moderate, or limited public evidence. The source cards on each profile explain what was observed and when it was last reviewed. Evidence of past guiding does not prove current availability, licensing status, price, insurance, or service quality.

## Corrections and removal

The person shown, an authorized representative, or a reader with evidence can use the Claim / Correct / Remove form. Requests are reviewed by an administrator. We may update wording, add evidence, mark a profile as claimed after verification, or remove the public listing.

## What travelers should verify

Confirm identity on the destination platform, ask for current credentials where relevant, agree on itinerary and fees in writing, and understand cancellation and payment arrangements. Never send sensitive identity documents through an unverified channel.`,
    guides: [],
  },
  {
    slug: "tea-food-and-neighborhoods-chengdu",
    title: "Tea, Food, and Neighborhoods: Choosing a Chengdu Guide by Interest",
    excerpt: "Use interests—not generic popularity—to find a guide whose public work matches the kind of Chengdu day you actually want.",
    cover: "/images/cover-tea-food-neighborhoods.jpg",
    category: "Guide matching",
    minutes: 5,
    featured: false,
    body: `## Begin with the day you want

Instead of searching for the “best” guide, define the experience you want help interpreting. A tea-focused morning, a food walk, a classic-sights introduction, and a western Sichuan extension require different knowledge and pacing.

## Tea culture and everyday Chengdu

If you want parks, teahouses, and neighborhood conversation, look for public evidence that mentions those settings—not simply a broad “city tour” label. Ask whether the guide can explain etiquette, ordering, and the social role of tea without turning the visit into a scripted stop.

## Food without assumptions

Tell a guide about allergies, dietary restrictions, and your comfort with spice before the day begins. Ask whether tasting costs are included and whether the route can adapt. Public content can suggest an interest in food, but only a direct conversation can confirm the actual itinerary.

## Classic sights for a first visit

For pandas, Kuanzhai Alley, Wenshu Monastery, or Sichuan opera, use the source cards to see which topics have appeared in a guide's public work. This is evidence of a connection, not a quality score.

## Longer routes

Jiuzhaigou and western Sichuan involve more planning than a city walk. Confirm transport, permits or venue requirements where applicable, overnight arrangements, weather contingencies, and who is responsible for each booking.

> Match on evidence, then verify in conversation. LocalMate China records no star ratings and publishes no fabricated testimonials.`,
    guides: ["luo-shijia", "xu-yao", "feng-yan"],
  },
];

for (const article of articles) {
  await connection.execute(
    `INSERT INTO blog_posts
      (slug, title, excerpt, bodyMarkdown, coverImageUrl, category, seoTitle, seoDescription, status, isFeatured, readingMinutes, sortOrder, publishedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), excerpt = VALUES(excerpt), bodyMarkdown = VALUES(bodyMarkdown),
       coverImageUrl = VALUES(coverImageUrl), category = VALUES(category), seoTitle = VALUES(seoTitle),
       seoDescription = VALUES(seoDescription), status = VALUES(status), isFeatured = VALUES(isFeatured),
       readingMinutes = VALUES(readingMinutes), sortOrder = VALUES(sortOrder), publishedAt = VALUES(publishedAt)`,
    [article.slug, article.title, article.excerpt, article.body, article.cover, article.category, article.title, article.excerpt, article.status ?? "published", article.featured, article.minutes, article.sortOrder ?? 0, article.publishedAt ?? "2026-07-13 12:00:00"],
  );
  const [[postRow]] = await connection.execute("SELECT id FROM blog_posts WHERE slug = ?", [article.slug]);
  await connection.execute("DELETE FROM blog_guide_links WHERE blogPostId = ?", [postRow.id]);
  let sortOrder = 0;
  for (const guideSlug of article.guides) {
    const [[guideRow]] = await connection.execute("SELECT id FROM guides WHERE slug = ?", [guideSlug]);
    await connection.execute(
      "INSERT INTO blog_guide_links (blogPostId, guideId, sortOrder) VALUES (?, ?, ?)",
      [postRow.id, guideRow.id, sortOrder++],
    );
  }
}

await connection.end();
console.log(`Seeded ${guides.length} guide profiles, ${tags.length} tags, and ${articles.length} articles.`);
