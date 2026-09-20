import DOMPurify from "dompurify";

const TOUR_TEXT_TAGS = ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li"];

export const sanitizeTourDescription = (value: string): string =>
  DOMPurify.sanitize(value || "", {
    ALLOWED_TAGS: TOUR_TEXT_TAGS,
    ALLOWED_ATTR: [],
  });

export const tourDescriptionToPlainText = (value: string): string => {
  if (!value) return "";

  const container = document.createElement("div");
  container.innerHTML = sanitizeTourDescription(value);
  return (container.textContent || "").replace(/\s+/g, " ").trim();
};