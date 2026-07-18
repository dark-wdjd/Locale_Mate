import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  listGuides: vi.fn(),
  getGuideBySlug: vi.fn(),
  getGuideById: vi.fn(),
  listTags: vi.fn(),
  recordOutboundClick: vi.fn(),
  submitClaimRequest: vi.fn(),
  listBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";

function createContext(role?: "user" | "admin"): TrpcContext {
  const user = role
    ? {
        id: role === "admin" ? 1 : 2,
        openId: `${role}-open-id`,
        email: `${role}@example.com`,
        name: role === "admin" ? "Admin" : "User",
        loginMethod: "manus",
        role,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        lastSignedIn: new Date("2026-01-01T00:00:00.000Z"),
      }
    : null;

  return {
    user,
    req: {
      protocol: "https",
      ip: "203.0.113.9",
      headers: {
        "x-forwarded-for": "203.0.113.9",
        "user-agent": "LocalMate-Test/1.0",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LocalMate public routes", () => {
  it("passes normalized filters to the public guide directory query", async () => {
    const expected = [{ id: 7, slug: "tea-route", displayName: "Tea Route Guide" }];
    vi.mocked(db.listGuides).mockResolvedValue(expected as never);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.guides.list({
      search: "tea",
      tag: "tea-culture",
      featuredOnly: true,
      limit: 12,
      offset: 0,
    });

    expect(result).toEqual(expected);
    expect(db.listGuides).toHaveBeenCalledWith({
      search: "tea",
      tagSlug: "tea-culture",
      featuredOnly: true,
      limit: 12,
      offset: 0,
    });
  });

  it("exposes only published journal entries through the public blog list", async () => {
    const published = [{ id: 30001, slug: "after-sunset-fun-in-chengdu", title: "After sunset fun in Chengdu" }];
    vi.mocked(db.listBlogPosts).mockResolvedValue(published as never);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.blog.list({});

    expect(result).toEqual(published);
    expect(db.listBlogPosts).toHaveBeenCalledWith({
      publishedOnly: true,
      category: undefined,
      featuredOnly: undefined,
    });
  });

  it("records an anonymous hashed outbound click and returns only the verified source URL", async () => {
    const source = {
      id: 31,
      platform: "xiaohongshu" as const,
      sourceType: "profile" as const,
      url: "https://www.xiaohongshu.com/user/profile/example",
    };
    vi.mocked(db.getGuideById).mockResolvedValue({
      id: 12,
      status: "unclaimed",
      sources: [source],
    } as never);
    vi.mocked(db.recordOutboundClick).mockResolvedValue(undefined as never);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.guides.recordClick({
      guideId: 12,
      sourceId: 31,
      pagePath: "/guides/tea-route",
      referrerPath: "/guides",
    });

    expect(result).toEqual({ success: true, targetUrl: source.url });
    expect(db.recordOutboundClick).toHaveBeenCalledOnce();
    expect(db.recordOutboundClick).toHaveBeenCalledWith(
      expect.objectContaining({
        guideId: 12,
        sourceId: 31,
        targetUrl: source.url,
        pagePath: "/guides/tea-route",
        referrerPath: "/guides",
        clickType: "xiaohongshu_profile",
        sessionHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        userAgentHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it("preserves a canonical Xiaohongshu profile URL for a verified guide", async () => {
    const source = {
      id: 88,
      platform: "xiaohongshu" as const,
      sourceType: "profile" as const,
      url: "https://www.xiaohongshu.com/user/profile/5ed4f2a1000000000101d629",
    };
    vi.mocked(db.getGuideById).mockResolvedValue({
      id: 88,
      status: "unclaimed",
      sources: [source],
    } as never);
    vi.mocked(db.recordOutboundClick).mockResolvedValue(undefined as never);

    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.guides.recordClick({
        guideId: 88,
        sourceId: 88,
        pagePath: "/guides/chengdu-english-guide-susan",
      }),
    ).resolves.toEqual({ success: true, targetUrl: source.url });

    expect(db.recordOutboundClick).toHaveBeenCalledWith(
      expect.objectContaining({ targetUrl: source.url, clickType: "xiaohongshu_profile" }),
    );
  });

  it("accepts a valid public correction request for administrator review", async () => {
    const stored = { id: 44, status: "pending" as const };
    vi.mocked(db.submitClaimRequest).mockResolvedValue(stored as never);

    const input = {
      guideId: 12,
      requestType: "correction" as const,
      requesterName: "Evidence Sender",
      requesterEmail: "sender@example.com",
      relationship: "Independent reader",
      message: "The public profile changed recently; please review the linked evidence and update the professional description.",
      evidenceUrl: "https://example.com/public-evidence",
    };
    const caller = appRouter.createCaller(createContext());

    await expect(caller.operations.submit(input)).resolves.toEqual(stored);
    expect(db.submitClaimRequest).toHaveBeenCalledWith(input);
  });
});

describe("LocalMate administrator authorization", () => {
  it("rejects a signed-in non-admin before the guide management query runs", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.guides.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.listGuides).not.toHaveBeenCalled();
  });
});
