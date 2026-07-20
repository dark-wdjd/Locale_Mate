// Snapshots the current database content into scripts/seed-data.json.
// Run after editing content in the admin panel, then commit the JSON:
//   node --env-file=.env scripts/export-content.mjs
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [tags] = await connection.execute("SELECT slug, name, category, description FROM tags ORDER BY id");

const [guideRows] = await connection.execute(
  `SELECT id, slug, displayName, shortBio, longBio, city, languages, status,
          isClaimed, isFeatured, isEditorsPick, avatarUrl, lastVerifiedAt
   FROM guides ORDER BY id`,
);
const guides = [];
for (const g of guideRows) {
  const [tagRows] = await connection.execute(
    `SELECT t.slug FROM guide_tag_links l INNER JOIN tags t ON t.id = l.tagId WHERE l.guideId = ? ORDER BY t.slug`,
    [g.id],
  );
  const [sources] = await connection.execute(
    `SELECT platform, sourceType, url, publicTitle, evidenceSummary, isPrimary, verifiedAt
     FROM guide_sources WHERE guideId = ? ORDER BY id`,
    [g.id],
  );
  const { id, ...rest } = g;
  guides.push({ ...rest, tags: tagRows.map(row => row.slug), sources });
}

const [postRows] = await connection.execute(
  `SELECT id, slug, title, excerpt, bodyMarkdown, coverImageUrl, category, seoTitle, seoDescription,
          status, isFeatured, readingMinutes, sortOrder, publishedAt
   FROM blog_posts ORDER BY id`,
);
const articles = [];
for (const p of postRows) {
  const [links] = await connection.execute(
    `SELECT g.slug FROM blog_guide_links l INNER JOIN guides g ON g.id = l.guideId WHERE l.blogPostId = ? ORDER BY l.sortOrder`,
    [p.id],
  );
  const { id, ...rest } = p;
  articles.push({ ...rest, guides: links.map(row => row.slug) });
}

await connection.end();

const outPath = path.join(import.meta.dirname, "seed-data.json");
fs.writeFileSync(outPath, `${JSON.stringify({ tags, guides, articles }, null, 2)}\n`);
console.log(`Exported ${tags.length} tags, ${guides.length} guides, ${articles.length} articles to ${outPath}`);
