import type { Express, NextFunction, Request, Response } from "express";
import { translations } from "../../client/src/lib/translations";
import { getBlogPostBySlug, getGuideBySlug, listBlogPosts, listGuides } from "../db";

// Public origin used for canonical URLs, the sitemap and robots.txt.
// Set SITE_URL (e.g. https://meetchengdu.com) in Render once the custom domain is live.
export const SITE_URL = (process.env.SITE_URL ?? "https://localmate-chengdu.onrender.com").replace(/\/$/, "");
const DEFAULT_IMAGE = "/images/chengdu-hero-anshun-bridge.jpg";

const en = (key: string) => translations[key]?.en ?? "";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type PageMeta = { title: string; description: string; image?: string | null; type?: "website" | "article"; body: string };

const link = (href: string, text: string) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;

async function guideListBody() {
  const guides = await listGuides({ limit: 100, offset: 0 });
  return `<ul>${guides.map(guide => `<li>${link(`/guides/${guide.slug}`, guide.displayName)}: ${escapeHtml(guide.shortBio)}</li>`).join("")}</ul>`;
}

async function articleListBody() {
  const posts = await listBlogPosts({ publishedOnly: true });
  return `<ul>${posts.map(post => `<li>${link(`/blog/${post.slug}`, post.title)}: ${escapeHtml(post.excerpt ?? "")}</li>`).join("")}</ul>`;
}

// Builds per-route metadata plus a plain-HTML summary of the page, so crawlers
// that don't run JavaScript (or Google's first pass) see real, distinct content.
// React's createRoot replaces this markup as soon as the app mounts.
async function resolvePage(pathname: string): Promise<PageMeta | null> {
  const nav = `<nav>${link("/", "Home")} · ${link("/guides", "Guide directory")} · ${link("/blog", "Journal")} · ${link("/about", "Methodology")}</nav>`;
  const page = (h1: string, intro: string, extra = "") => `${nav}<main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(intro)}</p>${extra}</main>`;

  if (pathname === "/") {
    return { title: en("home.metaTitle"), description: en("home.metaDescription"), body: page(en("home.title"), en("home.metaDescription"), await guideListBody()) };
  }
  if (pathname === "/guides") {
    return { title: en("directory.metaTitle"), description: en("directory.metaDescription"), body: page(en("directory.title"), en("directory.intro"), await guideListBody()) };
  }
  if (pathname === "/blog") {
    return { title: en("blog.metaTitle"), description: en("blog.metaDescription"), body: page(en("blog.title"), en("blog.metaDescription"), await articleListBody()) };
  }
  if (pathname === "/about") {
    return {
      title: en("about.metaTitle"),
      description: en("about.metaDescription"),
      body: page(en("about.title"), en("about.intro"), `<h2>${escapeHtml(en("about.disclaimerTitle"))}</h2><p>${escapeHtml(en("about.disclaimerCopy"))}</p>`),
    };
  }
  if (pathname === "/claim") {
    return { title: en("claim.metaTitle"), description: en("claim.metaDescription"), body: page(en("claim.metaTitle"), en("claim.metaDescription")) };
  }

  const guideMatch = pathname.match(/^\/guides\/([a-z0-9-]+)$/);
  if (guideMatch) {
    const guide = await getGuideBySlug(guideMatch[1]);
    if (!guide) return null;
    const sources = guide.sources.map(source => `<li>${link(source.url, source.publicTitle ?? "Public source")}</li>`).join("");
    return {
      title: guide.displayName,
      description: guide.shortBio,
      image: guide.avatarUrl,
      body: page(guide.displayName, guide.shortBio, `<p>${escapeHtml(guide.longBio ?? "")}</p><h2>Public sources</h2><ul>${sources}</ul><p>${escapeHtml(en("guide.disclaimer"))}</p>`),
    };
  }

  const postMatch = pathname.match(/^\/blog\/([a-z0-9-]+)$/);
  if (postMatch) {
    const post = await getBlogPostBySlug(postMatch[1]);
    if (!post) return null;
    return {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? "",
      image: post.coverImageUrl,
      type: "article",
      body: page(post.title, post.excerpt ?? ""),
    };
  }

  return null;
}

function setTag(html: string, pattern: RegExp, replacement: string) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `    ${replacement}\n  </head>`);
}

export async function renderPageHtml(template: string, pathname: string) {
  const meta = await resolvePage(pathname).catch(error => {
    console.error("[seo] failed to resolve page metadata", error);
    return null;
  });
  if (!meta) return template;

  const fullTitle = escapeHtml(`${meta.title} | LocalMate China`);
  const description = escapeHtml(meta.description);
  const canonical = escapeHtml(`${SITE_URL}${pathname === "/" ? "/" : pathname}`);
  const imagePath = meta.image ?? DEFAULT_IMAGE;
  const image = escapeHtml(imagePath.startsWith("http") ? imagePath : `${SITE_URL}${imagePath}`);

  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${fullTitle}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${meta.type ?? "website"}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${fullTitle}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
  return html.replace('<div id="root"></div>', `<div id="root">${meta.body}</div>`);
}

// When CANONICAL_HOST is set (e.g. meetchengdu.com), permanently redirect every
// other public hostname (the old onrender.com URL, www.) to it.
export function registerCanonicalHostRedirect(app: Express) {
  const canonicalHost = process.env.CANONICAL_HOST;
  if (!canonicalHost) return;
  app.use((req: Request, res: Response, next: NextFunction) => {
    const host = req.hostname;
    if (!host || host === canonicalHost || host === "localhost" || host === "127.0.0.1") return next();
    res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
  });
}

export function registerRobotsRoute(app: Express) {
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  });
}
