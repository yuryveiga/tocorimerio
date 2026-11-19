import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // Client with user's JWT for RLS-based auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: corsHeaders });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller identity
    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      console.error("Caller auth error:", callerError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Check if caller is admin using service role (bypasses RLS)
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("email", caller.email)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      console.error("Not admin:", profileError?.message, profile?.role);
      return new Response(JSON.stringify({ error: "Forbidden: Only admins can manage users" }), { status: 403, headers: corsHeaders });
    }

    const { action, email, password, role } = await req.json();
    console.log("Action:", action);

    if (action === "create_user") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers: corsHeaders });
      }

      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) throw createError;

      const { error: pError } = await adminClient
        .from("profiles")
        .insert({ email, role: role || "user" });

      if (pError) throw pError;

      return new Response(JSON.stringify({ success: true, user: userData.user }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_password") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers: corsHeaders });
      }

      // Paginate through all users to find by email
      let targetUser = null;
      let page = 1;
      const perPage = 100;
      while (!targetUser) {
        const { data: batch, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage });
        if (listError) throw listError;
        if (!batch.users || batch.users.length === 0) break;
        targetUser = batch.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (batch.users.length < perPage) break;
        page++;
      }

      if (!targetUser) {
        // User exists in profiles but not in Auth — auto-create in Auth
        console.log("User not in Auth, auto-creating");
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createError) throw createError;
        console.log("Auto-created user in Auth and set password");
        return new Response(JSON.stringify({ success: true, auto_created: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUser.id, {
        password,
      });

      if (updateError) throw updateError;

      console.log("Password updated");
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_role") {
      if (!email || !role) {
        return new Response(JSON.stringify({ error: "Email and role are required" }), { status: 400, headers: corsHeaders });
      }

      const { error: updateError } = await adminClient
        .from("profiles")
        .update({ role })
        .eq("email", email);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });

  } catch (error: any) {
    console.error("Function error:", error?.message);
    return new Response(JSON.stringify({ error: error?.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
