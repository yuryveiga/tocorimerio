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
  name: "list_recent_sales",
  title: "List recent sales",
  description:
    "List the most recent sales/reservations. Admin-only: RLS returns rows only when the signed-in user has the admin role.",
  inputSchema: {
    only_paid: z.boolean().optional().describe("If true, only paid sales are returned."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ only_paid, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("sales")
      .select(
        "id, tour_title, customer_name, customer_email, quantity, total_price, selected_date, selected_period, is_paid, is_archived, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (only_paid) q = q.eq("is_paid", true);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { sales: data },
    };
  },
});