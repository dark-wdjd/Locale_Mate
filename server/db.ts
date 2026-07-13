import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  or,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  blogGuideLinks,
  blogPosts,
  claimRequests,
  guideSources,
  guideTagLinks,
  guides,
  InsertBlogPost,
  InsertClaimRequest,
  InsertGuide,
  InsertGuideSource,
  InsertTag,
  outboundClicks,
  tags,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach(field => {
    if (user[field] === undefined) return;
    const normalized = user[field] ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function hydrateGuides<T extends { id: number }>(rows: T[]) {
  if (!rows.length) return [];
  const db = await requireDb();
  const ids = rows.map(row => row.id);
  const [tagRows, sourceRows] = await Promise.all([
    db
      .select({ guideId: guideTagLinks.guideId, id: tags.id, slug: tags.slug, name: tags.name, category: tags.category })
      .from(guideTagLinks)
      .innerJoin(tags, eq(guideTagLinks.tagId, tags.id))
      .where(inArray(guideTagLinks.guideId, ids))
      .orderBy(asc(tags.category), asc(tags.name)),
    db
      .select()
      .from(guideSources)
      .where(inArray(guideSources.guideId, ids))
      .orderBy(desc(guideSources.isPrimary), desc(guideSources.verifiedAt)),
  ]);

  return rows.map(row => ({
    ...row,
    tags: tagRows.filter(tag => tag.guideId === row.id).map(({ guideId: _guideId, ...tag }) => tag),
    sources: sourceRows.filter(source => source.guideId === row.id),
  }));
}

export async function listGuides(input: {
  search?: string;
  tagSlug?: string;
  featuredOnly?: boolean;
  includeRemoved?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const db = await requireDb();
  const limit = Math.min(input.limit ?? 24, 100);
  const offset = input.offset ?? 0;
  const filters = [];

  if (!input.includeRemoved) filters.push(or(eq(guides.status, "active"), eq(guides.status, "unclaimed"))!);
  if (input.featuredOnly) filters.push(eq(guides.isFeatured, true));
  if (input.search) {
    const pattern = `%${input.search.trim()}%`;
    filters.push(or(like(guides.displayName, pattern), like(guides.shortBio, pattern), like(guides.longBio, pattern))!);
  }
  if (input.tagSlug) {
    const taggedGuideIds = db
      .select({ guideId: guideTagLinks.guideId })
      .from(guideTagLinks)
      .innerJoin(tags, eq(tags.id, guideTagLinks.tagId))
      .where(eq(tags.slug, input.tagSlug));
    filters.push(inArray(guides.id, taggedGuideIds));
  }

  const rows = await db
    .select()
    .from(guides)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(guides.isFeatured), desc(guides.isEditorsPick), asc(guides.displayName))
    .limit(limit)
    .offset(offset);
  return hydrateGuides(rows);
}

export async function getGuideBySlug(slug: string, includeRemoved = false) {
  const db = await requireDb();
  const filters = [eq(guides.slug, slug)];
  if (!includeRemoved) filters.push(or(eq(guides.status, "active"), eq(guides.status, "unclaimed"))!);
  const rows = await db.select().from(guides).where(and(...filters)).limit(1);
  const hydrated = await hydrateGuides(rows);
  return hydrated[0];
}

export async function getGuideById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  const hydrated = await hydrateGuides(rows);
  return hydrated[0];
}

export async function createGuide(values: InsertGuide, tagIds: number[] = []) {
  const db = await requireDb();
  const result = await db.insert(guides).values(values);
  const id = Number(result[0].insertId);
  if (tagIds.length) await db.insert(guideTagLinks).values(tagIds.map(tagId => ({ guideId: id, tagId })));
  return getGuideById(id);
}

export async function updateGuide(id: number, values: Partial<InsertGuide>, tagIds?: number[]) {
  const db = await requireDb();
  await db.update(guides).set(values).where(eq(guides.id, id));
  if (tagIds) {
    await db.delete(guideTagLinks).where(eq(guideTagLinks.guideId, id));
    if (tagIds.length) await db.insert(guideTagLinks).values(tagIds.map(tagId => ({ guideId: id, tagId })));
  }
  return getGuideById(id);
}

export async function removeGuide(id: number) {
  const db = await requireDb();
  await db.update(guides).set({ status: "removed", isFeatured: false }).where(eq(guides.id, id));
  return { success: true } as const;
}

export async function listTags() {
  const db = await requireDb();
  return db.select().from(tags).orderBy(asc(tags.category), asc(tags.name));
}

export async function createTag(values: InsertTag) {
  const db = await requireDb();
  const result = await db.insert(tags).values(values);
  const rows = await db.select().from(tags).where(eq(tags.id, Number(result[0].insertId))).limit(1);
  return rows[0];
}

export async function updateTag(id: number, values: Partial<InsertTag>) {
  const db = await requireDb();
  await db.update(tags).set(values).where(eq(tags.id, id));
  return (await db.select().from(tags).where(eq(tags.id, id)).limit(1))[0];
}

export async function deleteTag(id: number) {
  const db = await requireDb();
  await db.delete(tags).where(eq(tags.id, id));
  return { success: true } as const;
}

export async function createGuideSource(values: InsertGuideSource) {
  const db = await requireDb();
  const result = await db.insert(guideSources).values(values);
  return (await db.select().from(guideSources).where(eq(guideSources.id, Number(result[0].insertId))).limit(1))[0];
}

export async function updateGuideSource(id: number, values: Partial<InsertGuideSource>) {
  const db = await requireDb();
  await db.update(guideSources).set(values).where(eq(guideSources.id, id));
  return (await db.select().from(guideSources).where(eq(guideSources.id, id)).limit(1))[0];
}

export async function deleteGuideSource(id: number) {
  const db = await requireDb();
  await db.delete(guideSources).where(eq(guideSources.id, id));
  return { success: true } as const;
}

export async function listBlogPosts(input: { publishedOnly?: boolean; category?: string; featuredOnly?: boolean } = {}) {
  const db = await requireDb();
  const filters = [];
  if (input.publishedOnly) filters.push(eq(blogPosts.status, "published"));
  if (input.category) filters.push(eq(blogPosts.category, input.category));
  if (input.featuredOnly) filters.push(eq(blogPosts.isFeatured, true));
  const posts = await db
    .select()
    .from(blogPosts)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(blogPosts.isFeatured), desc(blogPosts.publishedAt), desc(blogPosts.updatedAt));
  if (!posts.length) return [];
  const links = await db
    .select({ blogPostId: blogGuideLinks.blogPostId, guideId: blogGuideLinks.guideId })
    .from(blogGuideLinks)
    .where(inArray(blogGuideLinks.blogPostId, posts.map(post => post.id)))
    .orderBy(asc(blogGuideLinks.sortOrder));
  const guideIdsByPost = new Map<number, number[]>();
  for (const link of links) {
    const current = guideIdsByPost.get(link.blogPostId) ?? [];
    current.push(link.guideId);
    guideIdsByPost.set(link.blogPostId, current);
  }
  return posts.map(post => ({ ...post, guideIds: guideIdsByPost.get(post.id) ?? [] }));
}

export async function getBlogPostBySlug(slug: string, publishedOnly = true) {
  const db = await requireDb();
  const filters = [eq(blogPosts.slug, slug)];
  if (publishedOnly) filters.push(eq(blogPosts.status, "published"));
  const post = (await db.select().from(blogPosts).where(and(...filters)).limit(1))[0];
  if (!post) return undefined;

  const linked = await db
    .select({ guide: guides, editorialNote: blogGuideLinks.editorialNote, sortOrder: blogGuideLinks.sortOrder })
    .from(blogGuideLinks)
    .innerJoin(guides, eq(guides.id, blogGuideLinks.guideId))
    .where(and(eq(blogGuideLinks.blogPostId, post.id), or(eq(guides.status, "active"), eq(guides.status, "unclaimed"))))
    .orderBy(asc(blogGuideLinks.sortOrder));
  const hydrated = await hydrateGuides(linked.map(row => row.guide));
  return {
    ...post,
    relatedGuides: linked.map((row, index) => ({ ...hydrated[index], editorialNote: row.editorialNote })),
  };
}

export async function createBlogPost(values: InsertBlogPost, guideIds: number[] = []) {
  const db = await requireDb();
  const result = await db.insert(blogPosts).values(values);
  const id = Number(result[0].insertId);
  if (guideIds.length) {
    await db.insert(blogGuideLinks).values(guideIds.map((guideId, index) => ({ blogPostId: id, guideId, sortOrder: index })));
  }
  return getBlogPostById(id);
}

export async function getBlogPostById(id: number) {
  const db = await requireDb();
  return (await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1))[0];
}

export async function updateBlogPost(id: number, values: Partial<InsertBlogPost>, guideIds?: number[]) {
  const db = await requireDb();
  await db.update(blogPosts).set(values).where(eq(blogPosts.id, id));
  if (guideIds) {
    await db.delete(blogGuideLinks).where(eq(blogGuideLinks.blogPostId, id));
    if (guideIds.length) {
      await db.insert(blogGuideLinks).values(guideIds.map((guideId, index) => ({ blogPostId: id, guideId, sortOrder: index })));
    }
  }
  return getBlogPostById(id);
}

export async function deleteBlogPost(id: number) {
  const db = await requireDb();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return { success: true } as const;
}

export async function submitClaimRequest(values: InsertClaimRequest) {
  const db = await requireDb();
  const result = await db.insert(claimRequests).values(values);
  return { id: Number(result[0].insertId), status: "pending" as const };
}

export async function listClaimRequests(status?: "pending" | "reviewing" | "resolved" | "rejected") {
  const db = await requireDb();
  return db
    .select({ request: claimRequests, guideName: guides.displayName })
    .from(claimRequests)
    .leftJoin(guides, eq(guides.id, claimRequests.guideId))
    .where(status ? eq(claimRequests.status, status) : undefined)
    .orderBy(desc(claimRequests.createdAt));
}

export async function updateClaimRequest(id: number, values: { status: "pending" | "reviewing" | "resolved" | "rejected"; adminNote?: string | null }) {
  const db = await requireDb();
  await db
    .update(claimRequests)
    .set({ ...values, resolvedAt: values.status === "resolved" || values.status === "rejected" ? new Date() : null })
    .where(eq(claimRequests.id, id));
  return { success: true } as const;
}

export async function recordOutboundClick(values: typeof outboundClicks.$inferInsert) {
  const db = await requireDb();
  await db.insert(outboundClicks).values(values);
  return { success: true } as const;
}

export async function getAnalyticsSummary() {
  const db = await requireDb();
  const recentWindowStart = new Date();
  recentWindowStart.setUTCDate(recentWindowStart.getUTCDate() - 30);
  const [guideCount, postCount, requestCount, clickCount, topGuides, recentClickRows] = await Promise.all([
    db.select({ value: count() }).from(guides).where(or(eq(guides.status, "active"), eq(guides.status, "unclaimed"))),
    db.select({ value: count() }).from(blogPosts).where(eq(blogPosts.status, "published")),
    db.select({ value: count() }).from(claimRequests).where(eq(claimRequests.status, "pending")),
    db.select({ value: count() }).from(outboundClicks),
    db
      .select({ guideId: outboundClicks.guideId, displayName: guides.displayName, clicks: count() })
      .from(outboundClicks)
      .leftJoin(guides, eq(guides.id, outboundClicks.guideId))
      .groupBy(outboundClicks.guideId, guides.displayName)
      .orderBy(desc(count()))
      .limit(8),
    db
      .select({ clickedAt: outboundClicks.clickedAt })
      .from(outboundClicks)
      .where(gte(outboundClicks.clickedAt, recentWindowStart))
      .orderBy(desc(outboundClicks.clickedAt)),
  ]);

  const clicksByDate = new Map<string, number>();
  for (const row of recentClickRows) {
    const date = row.clickedAt.toISOString().slice(0, 10);
    clicksByDate.set(date, (clicksByDate.get(date) ?? 0) + 1);
  }
  const recentClicks = Array.from(clicksByDate, ([date, clicks]) => ({ date, clicks })).slice(0, 14);

  return {
    totals: {
      guides: Number(guideCount[0]?.value ?? 0),
      publishedPosts: Number(postCount[0]?.value ?? 0),
      pendingRequests: Number(requestCount[0]?.value ?? 0),
      outboundClicks: Number(clickCount[0]?.value ?? 0),
    },
    topGuides: topGuides.map(row => ({ ...row, clicks: Number(row.clicks) })),
    recentClicks: recentClicks.map(row => ({ ...row, clicks: Number(row.clicks) })).reverse(),
  };
}
