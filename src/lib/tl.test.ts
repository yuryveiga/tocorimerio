import { describe, it, expect, afterEach } from "vitest";
import { tl, setTlLanguage } from "./tl";
const c = { pt: "Olá", es: "Hola", en: "Hello", de: "Hallo" };
afterEach(() => setTlLanguage("en"));
describe("tl", () => {
  it("shows German to German visitors", () => { setTlLanguage("de"); expect(tl("en", c)).toBe("Hallo"); });
  it("falls back to English when French is missing", () => { setTlLanguage("fr"); expect(tl("en", c)).toBe("Hello"); });
  it("keeps Portuguese for Portuguese pages", () => { setTlLanguage("de"); expect(tl("pt", c)).toBe("Olá"); });
});
