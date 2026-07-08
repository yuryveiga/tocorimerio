import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listToursTool from "./tools/list-tours";
import getTourTool from "./tools/get-tour";
import listBlogPostsTool from "./tools/list-blog-posts";
import listRecentSalesTool from "./tools/list-recent-sales";

// Direct supabase.co issuer — construct from the project ref (never SUPABASE_URL,
// which may be the lovable.cloud proxy). Vite inlines this literal at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "tocorime-rio-mcp",
  title: "Tocorime Rio MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Tocorime Rio tourism site. Use `list_tours` / `get_tour` to explore active tours, `list_blog_posts` to browse published articles, and `list_recent_sales` for admin reservation data (returns rows only when the signed-in user is an admin).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listToursTool, getTourTool, listBlogPostsTool, listRecentSalesTool],
});