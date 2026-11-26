// Bulk re-translate tours, reviews and blog posts from PT to EN/ES using Lovable AI.
// Returns a streaming progress log so the admin UI can show live updates.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { reuseTranslation, translationStore } from "../_shared/translationReuse.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PROTECTED_NAMES = [
  "Tocorime Rio", "Pedra da Gávea", "Angra dos Reis", "Arraial do Cabo",
  "Búzios", "Petrópolis", "Maracanã", "Cristo Redentor", "Pão de Açúcar",
  "Pedra Bonita", "Pedra do Telégrafo", "Ipanema", "Copacabana", "Leblon",
  "Lapa", "Santa Marta", "Marius", "Rio de Janeiro", "Rio",
];

type Lang = "en" | "es";

async function translateBatch(
  fields: Record<string, string>,
  targetLang: Lang,
  db: any,
  force = false,
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());
  if (entries.length === 0) return {};

  const langName = targetLang === "en" ? "English" : "Spanish (Spain)";
  const protectedList = PROTECTED_NAMES.join(", ");

  const userPayload = entries
    .map(([key, value]) => `### ${key}\n${value}`)
    .join("\n\n");

  const systemPrompt = `You are a professional translator for a Brazilian tourism company in Rio de Janeiro.
Translate the following content from Brazilian Portuguese to ${langName}.

CRITICAL RULES:
- Keep these proper names UNCHANGED: ${protectedList}.
- Preserve HTML tags, line breaks, markdown and emojis exactly as they are.
- Always keep proper spacing between words. Never join words together.
- Use natural, fluent ${langName} suitable for a tourism marketing website.
- Do NOT add explanations or notes — only the translation.
- Return strictly JSON with the same keys as the input, no extra text.`;

  const generate = async () => {
  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPayload },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_translations",
              description: "Return the translated fields.",
              parameters: {
                type: "object",
                properties: {
                  translations: {
                    type: "object",
                    description:
                      "Object whose keys match the input field names and values are the translated strings.",
                    additionalProperties: { type: "string" },
                  },
                },
                required: ["translations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "return_translations" },
        },
      }),
    },
  );

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`AI gateway ${response.status}: ${txt.slice(0, 200)}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No tool call returned");
  const args = JSON.parse(toolCall.function.arguments);
  if (data.choices?.[0]?.finish_reason === "length") throw new Error("Incomplete translation");
  return args.translations || {};
  };
  const valid = (value: unknown): value is Record<string, string> => !!value && typeof value === "object" && entries.every(([key]) => typeof (value as Record<string, unknown>)[key] === "string" && String((value as Record<string, unknown>)[key]).trim().length > 0);
  return force ? generate() : reuseTranslation(translationStore(db), { model: "google/gemini-2.5-flash", systemPrompt, userPayload }, generate, valid);
}

serve();

function serve() {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
    const { data: userData } = bearer ? await supabase.auth.getUser(bearer) : { data: { user: null } };
    const { data: isAdmin } = userData?.user
      ? await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" })
      : { data: false };
    if (isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const send = (msg: unknown) =>
          controller.enqueue(enc.encode(JSON.stringify(msg) + "\n"));

        try {
          let scope: { tours?: boolean; reviews?: boolean; blog?: boolean; force?: boolean } = {
            tours: true,
            reviews: true,
            blog: true,
            force: false,
          };
          try {
            const body = await req.json();
            scope = { ...scope, ...body };
          } catch { /* no body, use defaults */ }

          // ---- TOURS ----
          if (scope.tours) {
            const { data: tours } = await supabase
              .from("tours")
              .select("id,title,short_description,category,title_en,short_description_en,category_en,title_es,short_description_es,category_es");

            send({ type: "section", name: "tours", total: tours?.length ?? 0 });

            for (const t of tours ?? []) {
              const fields = {
                title: t.title || "",
                short_description: t.short_description || "",
                category: t.category || "",
              };
              try {
                const needEn = scope.force || !t.title_en || !t.short_description_en;
                const needEs = scope.force || !t.title_es || !t.short_description_es;

                const update: Record<string, string> = {};
                if (needEn) {
                  const en = await translateBatch(fields, "en", supabase, scope.force);
                  if (en.title) update.title_en = en.title;
                  if (en.short_description) update.short_description_en = en.short_description;
                  if (en.category) update.category_en = en.category;
                }
                if (needEs) {
                  const es = await translateBatch(fields, "es", supabase, scope.force);
                  if (es.title) update.title_es = es.title;
                  if (es.short_description) update.short_description_es = es.short_description;
                  if (es.category) update.category_es = es.category;
                }

                if (Object.keys(update).length > 0) {
                  await supabase.from("tours").update(update).eq("id", t.id);
                }
                send({ type: "progress", section: "tours", item: t.title, ok: true });
              } catch (e) {
                send({ type: "progress", section: "tours", item: t.title, ok: false, error: String(e) });
              }
            }
          }

          // ---- REVIEWS ----
          if (scope.reviews) {
            const { data: reviews } = await supabase
              .from("reviews")
              .select("id,title,content,title_en,content_en,title_es,content_es");

            send({ type: "section", name: "reviews", total: reviews?.length ?? 0 });

            for (const r of reviews ?? []) {
              const fields = { title: r.title || "", content: r.content || "" };
              try {
                const needEn = scope.force || !r.title_en || !r.content_en;
                const needEs = scope.force || !r.title_es || !r.content_es;
                const update: Record<string, string> = {};
                if (needEn) {
                  const en = await translateBatch(fields, "en", supabase, scope.force);
                  if (en.title) update.title_en = en.title;
                  if (en.content) update.content_en = en.content;
                }
                if (needEs) {
                  const es = await translateBatch(fields, "es", supabase, scope.force);
                  if (es.title) update.title_es = es.title;
                  if (es.content) update.content_es = es.content;
                }
                if (Object.keys(update).length > 0) {
                  await supabase.from("reviews").update(update).eq("id", r.id);
                }
                send({ type: "progress", section: "reviews", item: r.title, ok: true });
              } catch (e) {
                send({ type: "progress", section: "reviews", item: r.title, ok: false, error: String(e) });
              }
            }
          }

          // ---- BLOG POSTS ----
          if (scope.blog) {
            const { data: posts } = await supabase
              .from("blog_posts")
              .select("id,title,excerpt,content,title_en,excerpt_en,content_en,title_es,excerpt_es,content_es");

            send({ type: "section", name: "blog", total: posts?.length ?? 0 });

            for (const p of posts ?? []) {
              const fields = {
                title: p.title || "",
                excerpt: p.excerpt || "",
                content: p.content || "",
              };
              try {
                const needEn = scope.force || !p.title_en || !p.content_en;
                const needEs = scope.force || !p.title_es || !p.content_es;
                const update: Record<string, string> = {};
                if (needEn) {
                  const en = await translateBatch(fields, "en", supabase, scope.force);
                  if (en.title) update.title_en = en.title;
                  if (en.excerpt) update.excerpt_en = en.excerpt;
                  if (en.content) update.content_en = en.content;
                }
                if (needEs) {
                  const es = await translateBatch(fields, "es", supabase, scope.force);
                  if (es.title) update.title_es = es.title;
                  if (es.excerpt) update.excerpt_es = es.excerpt;
                  if (es.content) update.content_es = es.content;
                }
                if (Object.keys(update).length > 0) {
                  await supabase.from("blog_posts").update(update).eq("id", p.id);
                }
                send({ type: "progress", section: "blog", item: p.title, ok: true });
              } catch (e) {
                send({ type: "progress", section: "blog", item: p.title, ok: false, error: String(e) });
              }
            }
          }

          send({ type: "done" });
        } catch (err) {
          const enc = new TextEncoder();
          controller.enqueue(
            enc.encode(JSON.stringify({ type: "error", error: String(err) }) + "\n"),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "application/x-ndjson" },
    });
  });
}
