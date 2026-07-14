import { describe, expect, it } from "vitest";
import { normalizeLanguage, translate } from "./LanguageContext";

describe("LanguageContext helpers", () => {
  it("normalizes persisted language values with English as the safe default", () => {
    expect(normalizeLanguage("zh")).toBe("zh");
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage(null)).toBe("en");
    expect(normalizeLanguage("unsupported")).toBe("en");
  });

  it("returns localized navigation copy", () => {
    expect(translate("en", "nav.findGuide")).toBe("Find a guide");
    expect(translate("zh", "nav.findGuide")).toBe("寻找向导");
  });

  it("interpolates dynamic values in the selected language", () => {
    expect(translate("zh", "directory.profileCount", { count: 3, suffix: "s" })).toBe("3 份公开资料");
    expect(translate("en", "directory.profileCount", { count: 3, suffix: "s" })).toBe("3 public profiles");
  });

  it("falls back to the translation key when no entry exists", () => {
    expect(translate("zh", "missing.translation.key")).toBe("missing.translation.key");
  });
});
