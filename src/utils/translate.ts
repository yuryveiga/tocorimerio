import { protect, restore } from "./translationProtector";

export async function translateText(text: string, targetLang: string, sourceLang: string = 'pt'): Promise<string> {
  if (!text || text.trim() === "") return "";
  
  try {
    const { protectedText, replacements } = protect(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(protectedText)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data[0]) {
      // Join multiple segments. Sometimes Google splits long sentences.
      // We join them and then clean up any double spaces that might result,
      // but primarily we remove the invisible characters that cause line break issues.
      // Preserve original leading/trailing whitespace which is crucial for HTML text nodes
      const leadingSpace = text.match(/^\s*/)?.[0] || "";
      const trailingSpace = text.match(/\s*$/)?.[0] || "";

      let translated = (data[0] as string[][])
        .map((s) => s[0])
        .join('');

      // Clean up invisible characters and normalize internal spaces
      translated = translated
        .replace(/&nbsp;/g, ' ')
        .replace(/[\u200B\u00AD]/g, '') // Remove zero-width spaces and soft hyphens
        .replace(/\u00A0/g, ' ')       // Replace non-breaking space with regular space
        .replace(/[^\n\r\S]+/g, ' '); // Collapse multiple internal spaces

      return restore(leadingSpace + translated.trim() + trailingSpace, replacements);
    }
    return text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Translation failed";
    console.error("Translation API error:", message);
    throw new Error(message);
  }
}

/**
 * Helper to translate HTML content (experimental - tries to preserve tags)
 */
export async function translateHtml(html: string, targetLang: string, sourceLang: string = 'pt'): Promise<string> {
  if (!html || html.trim() === "") return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  async function translateNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim() !== "") {
      const translated = await translateText(node.textContent, targetLang, sourceLang);
      node.textContent = translated;
    } else {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        await translateNode(child);
      }
    }
  }

  await translateNode(doc.body);

  let result = doc.body.innerHTML;
  
  // Fix spacing around inline tags that might have been lost during translation
  result = result
    .replace(/<\/strong>([^\s.,!?;:])/g, '</strong> $1') // Add space if missing after </strong>
    .replace(/([^\s])<strong>/g, '$1 <strong>')        // Add space if missing before <strong>
    .replace(/<\/a>([^\s.,!?;:])/g, '</a> $1')           // Add space if missing after </a>
    .replace(/([^\s])<a/g, '$1 <a')                      // Add space if missing before <a
    .replace(/<\/em>([^\s.,!?;:])/g, '</em> $1')         // Add space if missing after </em>
    .replace(/([^\s])<em>/g, '$1 <em>');                // Add space if missing before <em>
    
  return result;
}
