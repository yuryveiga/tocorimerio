// Allows the service role, the managed scheduler secret, or a verified admin user.
export async function isPrivilegedCaller(req: Request, db: any): Promise<boolean> {
  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!bearer) return false;
  const trusted = [
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    Deno.env.get("LOVABLE_CRON_SECRET"),
    Deno.env.get("LOVABLE_CRON_SECRET_PREVIOUS"),
  ].filter(Boolean);
  if (trusted.includes(bearer)) return true;
  const { data } = await db.auth.getUser(bearer);
  if (!data?.user) return false;
  const { data: isAdmin } = await db.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return isAdmin === true;
}
