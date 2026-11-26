import { describe, it, expect } from "vitest";
import { reuseTranslation, translationKey } from "../../supabase/functions/_shared/translationReuse";
import { changedTranslationFields } from "./translationChanges";

describe("translation token reuse", () => {
  it("repeated identical text and language use one AI generation", async () => {
    const data = new Map<string, unknown>();
    const store = { read: async (key: string) => data.get(key) ?? null, write: async (key: string, value: unknown) => { data.set(key, value); } };
    let calls = 0;
    const generate = async () => { calls++; return "Private tours"; };
    const valid = (v: unknown): v is string => typeof v === "string" && v.length > 0;
    expect(await reuseTranslation(store, { text: "Passeios privados", lang: "en" }, generate, valid)).toBe("Private tours");
    expect(await reuseTranslation(store, { text: "Passeios privados", lang: "en" }, generate, valid)).toBe("Private tours");
    expect(calls).toBe(1);
    await reuseTranslation(store, { text: "Passeios privados", lang: "es" }, generate, valid);
    expect(calls).toBe(2);
  });
  it("model, prompt and changed text have different cache keys", async () => {
    const base = { model: "a", prompt: "translate", text: "hello" };
    const key = await translationKey(base);
    for (const change of [{ model: "b" }, { prompt: "other" }, { text: "goodbye" }]) expect(await translationKey({ ...base, ...change })).not.toBe(key);
  });
  it("does not cache incomplete translations and survives unavailable cache", async () => {
    let writes = 0;
    const store = { read: async () => { throw new Error("offline"); }, write: async () => { writes++; } };
    const valid = (v: unknown): v is string => typeof v === "string" && v.length > 0;
    await expect(reuseTranslation(store, "text", async () => "", valid)).rejects.toThrow("Incomplete translation");
    expect(writes).toBe(0);
    expect(await reuseTranslation(store, "text", async () => "translated", valid)).toBe("translated");
    expect(writes).toBe(1);
  });
  it("price, photo and status edits send no translated fields", () => {
    const before = { title: "Passeio", title_en: "Tour", price: 100, image_url: "old", is_active: true };
    expect(changedTranslationFields("tours", before, { ...before, price: 200, image_url: "new", is_active: false })).toEqual([]);
  });
  it("a blog headline change sends only title, never unchanged article content", () => {
    const before = { title_en: "Old", content_en: "Long article", excerpt_en: "Intro" };
    expect(changedTranslationFields("blog_posts", before, { ...before, title_en: "New" })).toEqual(["title"]);
  });
  it("English fallback and cleared source changes are detected", () => {
    expect(changedTranslationFields("blog_posts", { title: "Antes" }, { title: "Depois" })).toEqual(["title"]);
    expect(changedTranslationFields("blog_posts", { content: "Antes" }, { content: "" })).toEqual(["content"]);
  });
});