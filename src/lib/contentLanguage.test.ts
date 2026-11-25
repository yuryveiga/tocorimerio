import { describe, it, expect } from "vitest";
import { overlayLanguage } from "./contentLanguage";
describe("overlayLanguage", () => {
  it("uses the German text in place of English", () => {
    expect(overlayLanguage({ title_en: "Hike", title_de: "Wanderung" }, "de").title_en).toBe("Wanderung");
  });
  it("keeps English when the German text is empty", () => {
    expect(overlayLanguage({ title_en: "Hike", title_de: "" }, "de").title_en).toBe("Hike");
  });
  it("leaves Spanish visitors untouched", () => {
    expect(overlayLanguage({ title_en: "Hike", title_de: "Wanderung" }, "es").title_en).toBe("Hike");
  });
});
