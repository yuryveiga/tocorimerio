import { describe, expect, it } from "vitest";
import { getMatchGallery } from "./matchImages";

const photos = [
  { key: "gallery__maracana__1", url: "maracana.jpg" },
  { key: "gallery__nilton_santos__2", url: "nilton-1.jpg" },
  { key: "gallery__nilton_santos__3", url: "nilton-2.jpg" },
  { key: "gallery__praia__4", url: "beach.jpg" },
  { key: "gallery__nilton_santos_extra__5", url: "other.jpg" },
];

describe("stadium match gallery", () => {
  it("uses only Nilton Santos category photos for Nilton Santos games", () => {
    expect(getMatchGallery({ stadium: "Estádio Nilton Santos", venue: "Maracanã" }, photos)
      .map((photo) => photo.url)).toEqual(["nilton-1.jpg", "nilton-2.jpg"]);
  });

  it("recognizes Engenhão and the venue fallback as Nilton Santos", () => {
    expect(getMatchGallery({ venue: "Engenhão" }, photos)
      .map((photo) => photo.url)).toEqual(["nilton-1.jpg", "nilton-2.jpg"]);
  });

  it("does not substitute Maracanã photos when Nilton Santos has no photos", () => {
    expect(getMatchGallery({ stadium: "Nilton Santos" }, [photos[0]])).toEqual([]);
  });

  it("preserves the Maracanã carousel for other games", () => {
    expect(getMatchGallery({ stadium: "Maracanã" }, photos)
      .map((photo) => photo.url)).toEqual(["maracana.jpg"]);
  });
});