import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const postStatus = z.enum(["draft", "published", "archived"]);
const postFields = z.object({
  slug: z.string().min(2).max(180).regex(/^[a-z0-9-]+$/),
  title: z.string().min(8).max(240),
  excerpt: z.string().min(20).max(500),
  bodyMarkdown: z.string().min(100).max(100000),
  coverImageUrl: z.string().url().max(2048).nullable().optional(),
  category: z.string().min(2).max(100),
  seoTitle: z.string().max(240).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  status: postStatus.default("draft"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(-1000).max(10000).default(0),
  readingMinutes: z.number().int().min(1).max(90).default(5),
  publishedAt: z.coerce.date().nullable().optional(),
  guideIds: z.array(z.number().int().positive()).default([]),
});

export const blogRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().max(100).optional(), featuredOnly: z.boolean().optional() }).default({}))
    .query(({ input }) => db.listBlogPosts({ publishedOnly: true, category: input.category, featuredOnly: input.featuredOnly })),

  getBySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(180) })).query(async ({ input }) => {
    const post = await db.getBlogPostBySlug(input.slug, true);
    if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
    return post;
  }),

  adminList: adminProcedure.query(() => db.listBlogPosts()),

  adminCreate: adminProcedure.input(postFields).mutation(({ input }) => {
    const { guideIds, ...values } = input;
    const normalized = {
      ...values,
      publishedAt: values.status === "published" ? values.publishedAt ?? new Date() : values.publishedAt,
    };
    return db.createBlogPost(normalized, guideIds);
  }),

  adminUpdate: adminProcedure.input(postFields.partial().extend({ id: z.number().int().positive(), guideIds: z.array(z.number().int().positive()).optional() })).mutation(({ input }) => {
    const { id, guideIds, ...values } = input;
    const normalized = {
      ...values,
      ...(values.status === "published" && values.publishedAt === undefined ? { publishedAt: new Date() } : {}),
    };
    return db.updateBlogPost(id, normalized, guideIds);
  }),

  adminDelete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteBlogPost(input.id)),
});
