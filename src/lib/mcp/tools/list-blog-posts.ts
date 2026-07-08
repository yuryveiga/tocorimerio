import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description: "List published Tocorime Rio blog posts (title, slug, language, published_at).",
  inputSchema: {
    language: z.enum(["pt", "en"]).optional().describe("Filter by language."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ language, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("blog_posts")
      .select("id, title, slug, language, published_at, meta_description")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit ?? 30);
    if (language) q = q.eq("language", language);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { posts: data },
    };
  },
});