import type { Express } from "express";
import { listBlogPosts, listGuides } from "../db";

const SITE_URL = process.env.SITE_URL ?? "https://localmate-chengdu.onrender.com";

const STATIC_PATHS = ["/", "/guides", "/blog", "/about"];

async function listAllGuides() {
  const all = [];
  let offset = 0;
  while (true) {
    const page = await listGuides({ limit: 100, offset });
    all.push(...page);
    if (page.length < 100) break;
    offset += 100;
  }
  return all;
}

function urlTag(loc: string, lastmod?: Date | null) {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
  return `<url><loc>${loc}</loc>${lastmodTag}</url>`;
}

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req, res, next) => {
    try {
      const [guides, posts] = await Promise.all([
        listAllGuides(),
        listBlogPosts({ publishedOnly: true }),
      ]);

      const urls = [
        ...STATIC_PATHS.map(path => urlTag(`${SITE_URL}${path}`)),
        ...guides.map(guide => urlTag(`${SITE_URL}/guides/${guide.slug}`, guide.updatedAt ?? guide.lastVerifiedAt)),
        ...posts.map(post => urlTag(`${SITE_URL}/blog/${post.slug}`, post.updatedAt ?? post.publishedAt)),
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
      res.type("application/xml").send(xml);
    } catch (error) {
      next(error);
    }
  });
}
