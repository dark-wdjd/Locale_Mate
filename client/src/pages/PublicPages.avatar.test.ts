import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("streamdown", () => ({
  Streamdown: () => null,
}));

import { GuideAvatar } from "./PublicPages";

describe("GuideAvatar", () => {
  it("renders initials instead of an image when avatarUrl is empty", () => {
    const markup = renderToStaticMarkup(
      createElement(GuideAvatar, {
        name: "Chengdu English Guide Penny",
        avatarUrl: null,
      }),
    );

    expect(markup).toContain(">CE</div>");
    expect(markup).not.toContain("<img");
  });

  it("renders the supplied image and accessible alternative text when avatarUrl exists", () => {
    const avatarUrl = "/manus-storage/susan-xiaohongshu-avatar_3c935e21.webp";
    const markup = renderToStaticMarkup(
      createElement(GuideAvatar, {
        name: "Chengdu English Guide Susan",
        avatarUrl,
      }),
    );

    expect(markup).toContain(`src="${avatarUrl}"`);
    expect(markup).toContain('alt="Chengdu English Guide Susan profile"');
  });
});
