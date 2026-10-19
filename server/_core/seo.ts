import type { Express, NextFunction, Request, Response } from "express";
import { marked } from "marked";
import { translations } from "../../client/src/lib/translations";
import { getBlogPostBySlug, getGuideBySlug, listBlogPosts, listGuides } from "../db";

// Public origin used for canonical URLs, the sitemap and robots.txt.
// Set SITE_URL (e.g. https://meetchengdu.com) in Render once the custom domain is live.
export const SITE_URL = (process.env.SITE_URL ?? "https://localmate-chengdu.onrender.com").replace(/\/$/, "");
const DEFAULT_IMAGE = "/images/chengdu-hero-anshun-bridge.jpg";

const en = (key: string) => translations[key]?.en ?? "";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type PageMeta = { title: string; description: string; image?: string | null; type?: "website" | "article"; body: string; jsonLd?: object | null };

// status 200 renders the page; 404/410 render a "not found" shell; redirect sends a 301.
type ResolvedPage = { status: 200; meta: PageMeta } | { status: 404 | 410 } | { status: 301; location: string };

const link = (href: string, text: string) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;

// Keep descriptions within what Google shows (~155 chars), cutting at a word boundary.
function clip(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

async function guideListBody() {
  const guides = await listGuides({ limit: 100, offset: 0 });
  return `<ul>${guides.map(guide => `<li>${link(`/guides/${guide.slug}`, guide.displayName)}: ${escapeHtml(guide.shortBio)}</li>`).join("")}</ul>`;
}

async function articleListBody() {
  const posts = await listBlogPosts({ publishedOnly: true });
  return `<ul>${posts.map(post => `<li>${link(`/blog/${post.slug}`, post.title)}: ${escapeHtml(post.excerpt ?? "")}</li>`).join("")}</ul>`;
}

// Mirrors the JSON-LD that PublicPages.tsx adds client-side (same id="ld-json",
// so useStructuredData replaces it in place after mount).
const aboutFaq = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ["What does MeetChengdu publish about a guide?", en("about.publish.copy")],
    ["What does MeetChengdu not publish?", en("about.notPublish.copy")],
    ["What should travelers still verify themselves before arranging a tour?", en("about.verify.copy")],
    ["Can a guide profile be corrected or removed?", en("about.optOut.copy")],
    ["Is MeetChengdu responsible for arrangements made with a listed guide?", en("about.disclaimerCopy")],
  ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
});

// Builds per-route metadata plus a plain-HTML version of the page, so crawlers
// that don't run JavaScript (or Google's first pass) see real, distinct content.
// React's createRoot replaces this markup as soon as the app mounts.
async function resolvePage(pathname: string): Promise<ResolvedPage> {
  const nav = `<nav>${link("/", "Home")} · ${link("/guides", "Guide directory")} · ${link("/blog", "Journal")} · ${link("/about", "Methodology")}</nav>`;
  const footer = `<footer><p>${escapeHtml(en("footer.description"))}</p></footer>`;
  const page = (h1: string, intro: string, extra = "") => `${nav}<main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(intro)}</p>${extra}</main>${footer}`;
  const ok = (meta: PageMeta): ResolvedPage => ({ status: 200, meta });

  if (pathname === "/") {
    return ok({
      title: en("home.metaTitle"),
      description: en("home.metaDescription"),
      body: page(en("home.title"), en("home.metaDescription"), await guideListBody()),
      // WebSite.name/alternateName is what Google uses for the site name; keep in sync with PublicPages.tsx.
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: "MeetChengdu", alternateName: ["Meet Chengdu", "meetchengdu.com"], url: `${SITE_URL}/` },
          { "@type": "Organization", name: "MeetChengdu", alternateName: "Meet Chengdu", url: `${SITE_URL}/` },
        ],
      },
    });
  }
  if (pathname === "/guides") {
    return ok({ title: en("directory.metaTitle"), description: en("directory.metaDescription"), body: page(en("directory.title"), en("directory.intro"), await guideListBody()) });
  }
  if (pathname === "/blog") {
    return ok({ title: en("blog.metaTitle"), description: en("blog.metaDescription"), body: page(en("blog.title"), en("blog.metaDescription"), await articleListBody()) });
  }
  if (pathname === "/about") {
    return ok({
      title: en("about.metaTitle"),
      description: en("about.metaDescription"),
      body: page(en("about.title"), en("about.intro"), `<h2>${escapeHtml(en("about.disclaimerTitle"))}</h2><p>${escapeHtml(en("about.disclaimerCopy"))}</p>`),
      jsonLd: aboutFaq(),
    });
  }
  if (pathname === "/claim") {
    return ok({ title: en("claim.metaTitle"), description: en("claim.metaDescription"), body: page(en("claim.metaTitle"), en("claim.metaDescription")) });
  }

  const guideMatch = pathname.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    const slug = guideMatch[1];
    if (slug !== slug.toLowerCase()) return { status: 301, location: `/guides/${slug.toLowerCase()}` };
    const guide = await getGuideBySlug(slug);
    if (!guide) return { status: (await getGuideBySlug(slug, true)) ? 410 : 404 };
    const sources = guide.sources.map(source => `<li>${link(source.url, source.publicTitle ?? "Public source")}</li>`).join("");
    return ok({
      title: guide.displayName,
      description: guide.shortBio,
      image: guide.avatarUrl,
      body: page(guide.displayName, guide.shortBio, `<p>${escapeHtml(guide.longBio ?? "")}</p><h2>Public sources</h2><ul>${sources}</ul><p>${escapeHtml(en("guide.disclaimer"))}</p>`),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: guide.displayName,
        description: guide.shortBio,
        ...(guide.avatarUrl ? { image: absolute(guide.avatarUrl) } : {}),
        url: `${SITE_URL}/guides/${guide.slug}`,
        jobTitle: "Tour Guide",
        address: { "@type": "PostalAddress", addressLocality: guide.city },
        knowsLanguage: guide.languages.split(",").map(part => part.trim()),
      },
    });
  }

  const postMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (postMatch) {
    const slug = postMatch[1];
    if (slug !== slug.toLowerCase()) return { status: 301, location: `/blog/${slug.toLowerCase()}` };
    const post = await getBlogPostBySlug(slug);
    if (!post) return { status: (await getBlogPostBySlug(slug, false)) ? 410 : 404 };
    const bodyHtml = await marked.parse(post.bodyMarkdown ?? "");
    return ok({
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? "",
      image: post.coverImageUrl,
      type: "article",
      body: page(post.title, post.excerpt ?? "", `<article>${bodyHtml}</article>`),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        ...(post.coverImageUrl ? { image: absolute(post.coverImageUrl) } : {}),
        ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
        dateModified: new Date(post.updatedAt).toISOString(),
        author: { "@type": "Organization", name: "MeetChengdu" },
      },
    });
  }

  // Client-only admin screens: serve the app shell but keep them out of the index.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return ok({ title: "Admin", description: "", body: "" });
  }

  return { status: 404 };
}

function setTag(html: string, pattern: RegExp, replacement: string) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `    ${replacement}\n  </head>`);
}

const NOINDEX = `<meta name="robots" content="noindex" />`;

export async function renderPageHtml(template: string, pathname: string): Promise<{ status: number; html: string; location?: string }> {
  let resolved: ResolvedPage;
  try {
    resolved = await resolvePage(pathname);
  } catch (error) {
    // Don't turn a database hiccup into 404s; fall back to the plain app shell.
    console.error("[seo] failed to resolve page metadata", error);
    return { status: 200, html: template };
  }

  if (resolved.status === 301) return { status: 301, html: "", location: resolved.location };
  if (resolved.status !== 200) {
    const gone = resolved.status === 410;
    let html = setTag(template, /<title>[\s\S]*?<\/title>/, `<title>${gone ? "Page removed" : "Page not found"} | MeetChengdu</title>`);
    html = setTag(html, /<meta name="robots"[^>]*>/, NOINDEX);
    return { status: resolved.status, html };
  }

  const meta = resolved.meta;
  const fullTitle = escapeHtml(meta.title.startsWith("MeetChengdu") ? meta.title : `${meta.title} | MeetChengdu`);
  const description = escapeHtml(clip(meta.description));
  const canonical = escapeHtml(`${SITE_URL}${pathname === "/" ? "/" : pathname}`);
  const image = escapeHtml(absolute(meta.image ?? DEFAULT_IMAGE));

  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${fullTitle}</title>`);
  if (pathname.startsWith("/admin")) return { status: 200, html: setTag(html, /<meta name="robots"[^>]*>/, NOINDEX) };
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${meta.type ?? "website"}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${fullTitle}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
  if (meta.jsonLd) {
    // Escape "<" so article text can't close the script tag early.
    const json = JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c");
    html = html.replace("</head>", `    <script id="ld-json" type="application/ld+json">${json}</script>\n  </head>`);
  }
  return { status: 200, html: html.replace('<div id="root"></div>', `<div id="root">${meta.body}</div>`) };
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
