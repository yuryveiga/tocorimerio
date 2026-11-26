import { describe, it, expect, vi, beforeEach } from "vitest";
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn().mockResolvedValue({ error: null }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
import { refreshExtraTranslations } from "./refreshExtraTranslations";

const translatedPost = {
  title_en: "Title", excerpt_en: "Intro", content_en: "Article",
  title_de: "Titel", excerpt_de: "Intro", content_de: "Artikel",
  title_fr: "Titre", excerpt_fr: "Intro", content_fr: "Article",
  title_it: "Titolo", excerpt_it: "Intro", content_it: "Articolo",
};
describe("admin translation triggers", () => {
  beforeEach(() => invoke.mockClear());
  it("unchanged article save makes no translation requests", () => {
    refreshExtraTranslations("blog_posts", "post", translatedPost, { ...translatedPost, image_url: "new-photo" });
    expect(invoke).not.toHaveBeenCalled();
  });
  it("changed headline sends title alone for each of three languages", () => {
    refreshExtraTranslations("blog_posts", "post", translatedPost, { ...translatedPost, title_en: "New title" });
    expect(invoke).toHaveBeenCalledTimes(3);
    for (const lang of ["de", "fr", "it"]) expect(invoke).toHaveBeenCalledWith("translate-content-languages", { body: { table: "blog_posts", id: "post", lang, fields: ["title"] } });
  });
  it("only a missing French excerpt is filled without retranslating other languages", () => {
    const post = { ...translatedPost, excerpt_fr: null };
    refreshExtraTranslations("blog_posts", "post", post, post);
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("translate-content-languages", { body: { table: "blog_posts", id: "post", lang: "fr", fields: ["excerpt"] } });
  });
});