
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Use --env-file=.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ") // Remove tags
    .replace(/\s+/g, " ")      // Collapse whitespace
    .trim();
}

async function generateExcerpts() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, excerpt, content');

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  const missing = posts.filter(p => !p.excerpt || p.excerpt.trim() === "");

  if (missing.length === 0) {
    console.log("✅ Todos os posts já possuem resumo.");
    return;
  }

  console.log(`\n🚀 Iniciando geração automática de resumos para ${missing.length} posts...\n`);

  let successCount = 0;

  for (const post of missing) {
    const cleanText = stripHtml(post.content);
    if (!cleanText) {
      console.log(`⚠️  Post "${post.title}" está sem conteúdo. Pulando...`);
      continue;
    }

    // Generate excerpt (max 155 chars for SEO)
    const newExcerpt = cleanText.substring(0, 155).trim() + "...";

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ excerpt: newExcerpt })
      .eq('id', post.id);

    if (updateError) {
      console.error(`❌ Erro ao atualizar "${post.title}":`, updateError);
    } else {
      console.log(`✅ Resumo gerado para: "${post.title}"`);
      successCount++;
    }
  }

  console.log(`\n✨ Finalizado! ${successCount} posts foram atualizados com sucesso.`);
}

generateExcerpts();
