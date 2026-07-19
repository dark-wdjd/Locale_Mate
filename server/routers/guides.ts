import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const guideStatus = z.enum(["active", "unclaimed", "removed"]);
const imageUrlOrPath = z
  .string()
  .max(2048)
  .refine(value => /^https?:\/\//.test(value) || value.startsWith("/"), {
    message: "Use a full http(s) URL or a site path starting with /",
  });
const sourcePlatform = z.enum(["xiaohongshu", "douyin", "media", "website"]);
const sourceType = z.enum(["profile", "post", "article", "search"]);
const tagCategory = z.enum(["language", "interest", "audience", "route", "style"]);

const guideFields = z.object({
  slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(160),
  shortBio: z.string().min(4).max(320),
  longBio: z.string().max(8000).nullable().optional(),
  city: z.string().min(2).max(80).default("Chengdu"),
  languages: z.string().min(2).max(240),
  status: guideStatus.default("unclaimed"),
  isClaimed: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isEditorsPick: z.boolean().default(false),
  avatarUrl: imageUrlOrPath.nullable().optional(),
  lastVerifiedAt: z.coerce.date().nullable().optional(),
  tagIds: z.array(z.number().int().positive()).default([]),
});

const sourceFields = z.object({
  guideId: z.number().int().positive(),
  platform: sourcePlatform,
  sourceType,
  url: z.string().url().max(2048),
  publicTitle: z.string().max(500).nullable().optional(),
  evidenceSummary: z.string().max(4000).nullable().optional(),
  isPrimary: z.boolean().default(false),
  verifiedAt: z.coerce.date(),
});

function publicGuideNotFound() {
  return new TRPCError({ code: "NOT_FOUND", message: "Guide not found" });
}

export const guidesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          search: z.string().max(120).optional(),
          tag: z.string().max(100).optional(),
          featuredOnly: z.boolean().optional(),
          limit: z.number().int().min(1).max(100).default(24),
          offset: z.number().int().min(0).default(0),
        })
        .default({ limit: 24, offset: 0 }),
    )
    .query(({ input }) => db.listGuides({ search: input.search, tagSlug: input.tag, featuredOnly: input.featuredOnly, limit: input.limit, offset: input.offset })),

  getBySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(160) })).query(async ({ input }) => {
    const guide = await db.getGuideBySlug(input.slug);
    if (!guide) throw publicGuideNotFound();
    return guide;
  }),

  tags: publicProcedure.query(() => db.listTags()),

  recordClick: publicProcedure
    .input(
      z.object({
        guideId: z.number().int().positive(),
        sourceId: z.number().int().positive(),
        pagePath: z.string().min(1).max(500),
        referrerPath: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const guide = await db.getGuideById(input.guideId);
      const source = guide?.sources.find(item => item.id === input.sourceId);
      if (!guide || guide.status === "removed" || !source) throw publicGuideNotFound();

      const forwarded = ctx.req.headers["x-forwarded-for"];
      const clientHint = `${Array.isArray(forwarded) ? forwarded[0] : forwarded ?? ctx.req.ip}|${ctx.req.headers["user-agent"] ?? ""}`;
      const salt = `${process.env.JWT_SECRET ?? "localmate"}|${new Date().toISOString().slice(0, 10)}`;
      const sessionHash = createHash("sha256").update(`${salt}|${clientHint}`).digest("hex");
      const userAgentHash = createHash("sha256").update(`${salt}|${ctx.req.headers["user-agent"] ?? ""}`).digest("hex");
      const clickType = source.platform === "xiaohongshu"
        ? source.sourceType === "profile"
          ? "xiaohongshu_profile"
          : "xiaohongshu_post"
        : source.platform === "douyin"
          ? "douyin"
          : "other";

      await db.recordOutboundClick({
        guideId: guide.id,
        sourceId: source.id,
        targetUrl: source.url,
        pagePath: input.pagePath,
        referrerPath: input.referrerPath,
        clickType,
        sessionHash,
        userAgentHash,
      });
      return { success: true, targetUrl: source.url } as const;
    }),

  adminList: adminProcedure.query(() => db.listGuides({ includeRemoved: true, limit: 100 })),

  adminCreate: adminProcedure.input(guideFields).mutation(({ input }) => {
    const { tagIds, ...values } = input;
    return db.createGuide(values, tagIds);
  }),

  adminUpdate: adminProcedure.input(guideFields.partial().extend({ id: z.number().int().positive(), tagIds: z.array(z.number().int().positive()).optional() })).mutation(({ input }) => {
    const { id, tagIds, ...values } = input;
    return db.updateGuide(id, values, tagIds);
  }),

  adminRemove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.removeGuide(input.id)),

  adminCreateSource: adminProcedure.input(sourceFields).mutation(({ input }) => db.createGuideSource(input)),
  adminUpdateSource: adminProcedure.input(sourceFields.partial().extend({ id: z.number().int().positive() })).mutation(({ input }) => {
    const { id, ...values } = input;
    return db.updateGuideSource(id, values);
  }),
  adminDeleteSource: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteGuideSource(input.id)),

  adminCreateTag: adminProcedure
    .input(z.object({ slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/), name: z.string().min(1).max(100), category: tagCategory, description: z.string().max(320).nullable().optional() }))
    .mutation(({ input }) => db.createTag(input)),
  adminUpdateTag: adminProcedure
    .input(z.object({ id: z.number().int().positive(), slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(), name: z.string().min(1).max(100).optional(), category: tagCategory.optional(), description: z.string().max(320).nullable().optional() }))
    .mutation(({ input }) => {
      const { id, ...values } = input;
      return db.updateTag(id, values);
    }),
  adminDeleteTag: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.deleteTag(input.id)),
});
