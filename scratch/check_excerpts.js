
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Use --env-file=.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBlogExcerpts() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, excerpt');

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  console.log(`\n🔍 Analisando ${posts.length} posts do blog...\n`);

  const missing = posts.filter(p => !p.excerpt || p.excerpt.trim() === "");

  if (missing.length === 0) {
    console.log("✅ Todos os posts têm resumo! Excelente para o SEO.");
  } else {
    console.log(`⚠️  Encontrei ${missing.length} posts sem resumo (excerpt):\n`);
    missing.forEach(p => {
      console.log(`   • ${p.title}`);
    });
    console.log("\n💡 Dica: Você pode gerar esses resumos automaticamente usando o novo botão 'Otimizar' na aba SEO de cada post.");
  }
}

checkBlogExcerpts();
