import { z } from "zod";
import * as db from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const requestType = z.enum(["claim", "correction", "opt_out", "removal"]);
const requestStatus = z.enum(["pending", "reviewing", "resolved", "rejected"]);

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

  adminList: adminProcedure.input(z.object({ status: requestStatus.optional() }).default({})).query(({ input }) => db.listClaimRequests(input.status)),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: requestStatus, adminNote: z.string().max(8000).nullable().optional() }))
    .mutation(({ input }) => {
      const { id, ...values } = input;
      return db.updateClaimRequest(id, values);
    }),

  analytics: adminProcedure.query(() => db.getAnalyticsSummary()),
});
