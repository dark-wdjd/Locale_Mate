import { createHash } from "node:crypto";
import { z } from "zod";
import * as db from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const requestType = z.enum(["claim", "correction", "opt_out", "removal"]);
const requestStatus = z.enum(["pending", "reviewing", "resolved", "rejected"]);
const contentEventInput = z
  .object({
    eventType: z.enum(["blog_view", "guide_card_click"]),
    pagePath: z.string().min(1).max(500),
    guideId: z.number().int().positive().nullable().optional(),
    blogPostId: z.number().int().positive().nullable().optional(),
    referrerPath: z.string().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.eventType === "blog_view" && !value.blogPostId) {
      ctx.addIssue({ code: "custom", path: ["blogPostId"], message: "blogPostId is required for blog views" });
    }
    if (value.eventType === "guide_card_click" && !value.guideId) {
      ctx.addIssue({ code: "custom", path: ["guideId"], message: "guideId is required for guide card clicks" });
    }
  });

export const operationsRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        guideId: z.number().int().positive().nullable().optional(),
        requestType,
        requesterName: z.string().trim().min(2).max(160),
        requesterEmail: z.string().trim().email().max(320),
        relationship: z.string().trim().min(2).max(200),
        message: z.string().trim().min(30).max(8000),
        evidenceUrl: z.string().url().max(2048).nullable().optional(),
      }),
    )
    .mutation(({ input }) => db.submitClaimRequest(input)),

  recordContentEvent: publicProcedure.input(contentEventInput).mutation(async ({ input, ctx }) => {
    const forwarded = ctx.req.headers["x-forwarded-for"];
    const clientHint = `${Array.isArray(forwarded) ? forwarded[0] : forwarded ?? ctx.req.ip}|${ctx.req.headers["user-agent"] ?? ""}`;
    const salt = `${process.env.JWT_SECRET ?? "localmate"}|${new Date().toISOString().slice(0, 10)}`;
    const sessionHash = createHash("sha256").update(`${salt}|${clientHint}`).digest("hex");
    await db.recordContentEvent({ ...input, sessionHash });
    return { success: true } as const;
  }),

  adminList: adminProcedure.input(z.object({ status: requestStatus.optional() }).default({})).query(({ input }) => db.listClaimRequests(input.status)),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: requestStatus, adminNote: z.string().max(8000).nullable().optional() }))
    .mutation(({ input }) => {
      const { id, ...values } = input;
      return db.updateClaimRequest(id, values);
    }),

  analytics: adminProcedure.query(() => db.getAnalyticsSummary()),
});
