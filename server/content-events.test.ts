import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    recordContentEvent: vi.fn(),
  };
});

import * as db from "./db";
import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      ip: "203.0.113.7",
      headers: {
        "x-forwarded-for": "203.0.113.7",
        "user-agent": "LocalMate test agent",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("operations.recordContentEvent", () => {
  beforeEach(() => {
    vi.mocked(db.recordContentEvent).mockReset().mockResolvedValue(undefined);
  });

  it("records an anonymous blog view without requiring authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.operations.recordContentEvent({
      eventType: "blog_view",
      blogPostId: 17,
      pagePath: "/blog/a-slower-first-day-in-chengdu",
      referrerPath: "/blog",
    });

    expect(result).toEqual({ success: true });
    expect(db.recordContentEvent).toHaveBeenCalledOnce();
    expect(db.recordContentEvent).toHaveBeenCalledWith({
      eventType: "blog_view",
      blogPostId: 17,
      pagePath: "/blog/a-slower-first-day-in-chengdu",
      referrerPath: "/blog",
      sessionHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it("records a guide card click with the associated guide", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await caller.operations.recordContentEvent({
      eventType: "guide_card_click",
      guideId: 9,
      pagePath: "/guides?interest=food",
    });

    expect(db.recordContentEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "guide_card_click",
        guideId: 9,
        pagePath: "/guides?interest=food",
        sessionHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it.each([
    { eventType: "blog_view" as const, pagePath: "/blog/missing-post" },
    { eventType: "guide_card_click" as const, pagePath: "/guides" },
  ])("rejects $eventType when its content identifier is missing", async input => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.operations.recordContentEvent(input)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.recordContentEvent).not.toHaveBeenCalled();
  });

  it("rejects unsupported event types before writing", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.operations.recordContentEvent({
        eventType: "profile_view",
        guideId: 9,
        pagePath: "/guides/example",
      } as never),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.recordContentEvent).not.toHaveBeenCalled();
  });
});
