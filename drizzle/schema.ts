import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth. Only administrators use accounts in the MVP. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const guides = mysqlTable(
  "guides",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    displayName: varchar("displayName", { length: 160 }).notNull(),
    shortBio: varchar("shortBio", { length: 320 }).notNull(),
    longBio: text("longBio"),
    city: varchar("city", { length: 80 }).default("Chengdu").notNull(),
    languages: varchar("languages", { length: 240 }).default("English, Mandarin").notNull(),
    status: mysqlEnum("status", ["active", "unclaimed", "removed"]).default("unclaimed").notNull(),
    isClaimed: boolean("isClaimed").default(false).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isEditorsPick: boolean("isEditorsPick").default(false).notNull(),
    avatarUrl: varchar("avatarUrl", { length: 2048 }),
    lastVerifiedAt: timestamp("lastVerifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("guides_slug_unique").on(table.slug),
    index("guides_status_idx").on(table.status),
    index("guides_featured_idx").on(table.isFeatured),
  ],
);

export const guideSources = mysqlTable(
  "guide_sources",
  {
    id: int("id").autoincrement().primaryKey(),
    guideId: int("guideId")
      .notNull()
      .references(() => guides.id, { onDelete: "cascade" }),
    platform: mysqlEnum("platform", ["xiaohongshu", "douyin", "media", "website"]).notNull(),
    sourceType: mysqlEnum("sourceType", ["profile", "post", "article", "search"]).notNull(),
    url: varchar("url", { length: 2048 }).notNull(),
    publicTitle: varchar("publicTitle", { length: 500 }),
    evidenceSummary: text("evidenceSummary"),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    verifiedAt: timestamp("verifiedAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("guide_sources_guide_idx").on(table.guideId),
    index("guide_sources_platform_idx").on(table.platform),
  ],
);

export const tags = mysqlTable(
  "tags",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    category: mysqlEnum("category", ["language", "interest", "audience", "route", "style"]).notNull(),
    description: varchar("description", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("tags_slug_unique").on(table.slug), index("tags_category_idx").on(table.category)],
);

export const guideTagLinks = mysqlTable(
  "guide_tag_links",
  {
    guideId: int("guideId")
      .notNull()
      .references(() => guides.id, { onDelete: "cascade" }),
    tagId: int("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    primaryKey({ columns: [table.guideId, table.tagId], name: "guide_tag_links_pk" }),
    index("guide_tag_links_tag_idx").on(table.tagId),
  ],
);

export const blogPosts = mysqlTable(
  "blog_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    excerpt: varchar("excerpt", { length: 500 }).notNull(),
    bodyMarkdown: text("bodyMarkdown").notNull(),
    coverImageUrl: varchar("coverImageUrl", { length: 2048 }),
    category: varchar("category", { length: 100 }).notNull(),
    seoTitle: varchar("seoTitle", { length: 240 }),
    seoDescription: varchar("seoDescription", { length: 320 }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    readingMinutes: int("readingMinutes").default(5).notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("blog_posts_slug_unique").on(table.slug),
    index("blog_posts_status_published_idx").on(table.status, table.publishedAt),
    index("blog_posts_category_idx").on(table.category),
  ],
);

export const blogGuideLinks = mysqlTable(
  "blog_guide_links",
  {
    blogPostId: int("blogPostId")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    guideId: int("guideId")
      .notNull()
      .references(() => guides.id, { onDelete: "cascade" }),
    editorialNote: varchar("editorialNote", { length: 320 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    primaryKey({ columns: [table.blogPostId, table.guideId], name: "blog_guide_links_pk" }),
    index("blog_guide_links_guide_idx").on(table.guideId),
  ],
);

export const outboundClicks = mysqlTable(
  "outbound_clicks",
  {
    id: int("id").autoincrement().primaryKey(),
    pagePath: varchar("pagePath", { length: 500 }).notNull(),
    guideId: int("guideId").references(() => guides.id, { onDelete: "set null" }),
    sourceId: int("sourceId").references(() => guideSources.id, { onDelete: "set null" }),
    targetUrl: varchar("targetUrl", { length: 2048 }).notNull(),
    clickType: mysqlEnum("clickType", ["xiaohongshu_profile", "xiaohongshu_post", "douyin", "other"]).notNull(),
    sessionHash: varchar("sessionHash", { length: 128 }),
    referrerPath: varchar("referrerPath", { length: 500 }),
    userAgentHash: varchar("userAgentHash", { length: 128 }),
    clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  },
  table => [
    index("outbound_clicks_clicked_idx").on(table.clickedAt),
    index("outbound_clicks_guide_idx").on(table.guideId),
    index("outbound_clicks_type_idx").on(table.clickType),
  ],
);

export const claimRequests = mysqlTable(
  "claim_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    guideId: int("guideId").references(() => guides.id, { onDelete: "set null" }),
    requestType: mysqlEnum("requestType", ["claim", "correction", "opt_out", "removal"]).notNull(),
    requesterName: varchar("requesterName", { length: 160 }).notNull(),
    requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
    relationship: varchar("relationship", { length: 200 }).notNull(),
    message: text("message").notNull(),
    evidenceUrl: varchar("evidenceUrl", { length: 2048 }),
    status: mysqlEnum("status", ["pending", "reviewing", "resolved", "rejected"]).default("pending").notNull(),
    adminNote: text("adminNote"),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("claim_requests_status_idx").on(table.status), index("claim_requests_guide_idx").on(table.guideId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = typeof guides.$inferInsert;
export type GuideSource = typeof guideSources.$inferSelect;
export type InsertGuideSource = typeof guideSources.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type OutboundClick = typeof outboundClicks.$inferSelect;
export type ClaimRequest = typeof claimRequests.$inferSelect;
export type InsertClaimRequest = typeof claimRequests.$inferInsert;
