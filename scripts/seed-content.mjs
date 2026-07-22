// Seeds the database from scripts/seed-data.json (idempotent — safe to re-run).
// The JSON is a snapshot of real content; refresh it with export-content.mjs.
//   node --env-file=.env scripts/seed-content.mjs
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { dbConnectionConfig } from "./db-config.mjs";

const { tags, guides, articles } = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "seed-data.json"), "utf-8"),
);

const connection = await mysql.createConnection(dbConnectionConfig());
const toDate = value => (value ? new Date(value) : null);

for (const tag of tags) {
  await connection.execute(
    `INSERT INTO tags (slug, name, category, description)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), description = VALUES(description)`,
    [tag.slug, tag.name, tag.category, tag.description],
  );
}

for (const guide of guides) {
  await connection.execute(
    `INSERT INTO guides
      (slug, displayName, shortBio, longBio, city, languages, status, isClaimed, isFeatured, isEditorsPick, avatarUrl, lastVerifiedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE displayName = VALUES(displayName), shortBio = VALUES(shortBio), longBio = VALUES(longBio),
       city = VALUES(city), languages = VALUES(languages), status = VALUES(status), isClaimed = VALUES(isClaimed),
       isFeatured = VALUES(isFeatured), isEditorsPick = VALUES(isEditorsPick), avatarUrl = VALUES(avatarUrl),
       lastVerifiedAt = VALUES(lastVerifiedAt)`,
    [
      guide.slug, guide.displayName, guide.shortBio, guide.longBio, guide.city, guide.languages, guide.status,
      guide.isClaimed ? 1 : 0, guide.isFeatured ? 1 : 0, guide.isEditorsPick ? 1 : 0, guide.avatarUrl,
      toDate(guide.lastVerifiedAt),
    ],
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
      `INSERT INTO guide_sources (guideId, platform, sourceType, url, publicTitle, evidenceSummary, isPrimary, verifiedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guideRow.id, source.platform, source.sourceType, source.url, source.publicTitle, source.evidenceSummary,
        source.isPrimary ? 1 : 0, toDate(source.verifiedAt) ?? new Date(),
      ],
    );
  }
}

for (const article of articles) {
  await connection.execute(
    `INSERT INTO blog_posts
      (slug, title, excerpt, bodyMarkdown, coverImageUrl, category, seoTitle, seoDescription, status, isFeatured, readingMinutes, sortOrder, publishedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), excerpt = VALUES(excerpt), bodyMarkdown = VALUES(bodyMarkdown),
       coverImageUrl = VALUES(coverImageUrl), category = VALUES(category), seoTitle = VALUES(seoTitle),
       seoDescription = VALUES(seoDescription), status = VALUES(status), isFeatured = VALUES(isFeatured),
       readingMinutes = VALUES(readingMinutes), sortOrder = VALUES(sortOrder), publishedAt = VALUES(publishedAt)`,
    [
      article.slug, article.title, article.excerpt, article.bodyMarkdown, article.coverImageUrl, article.category,
      article.seoTitle, article.seoDescription, article.status, article.isFeatured ? 1 : 0,
      article.readingMinutes, article.sortOrder ?? 0, toDate(article.publishedAt),
    ],
  );
  const [[postRow]] = await connection.execute("SELECT id FROM blog_posts WHERE slug = ?", [article.slug]);
  await connection.execute("DELETE FROM blog_guide_links WHERE blogPostId = ?", [postRow.id]);
  let sortOrder = 0;
  for (const guideSlug of article.guides) {
    const [[guideRow]] = await connection.execute("SELECT id FROM guides WHERE slug = ?", [guideSlug]);
    if (!guideRow) continue;
    await connection.execute(
      "INSERT INTO blog_guide_links (blogPostId, guideId, sortOrder) VALUES (?, ?, ?)",
      [postRow.id, guideRow.id, sortOrder++],
    );
  }
}

await connection.end();
console.log(`Seeded ${guides.length} guide profiles, ${tags.length} tags, and ${articles.length} articles.`);
