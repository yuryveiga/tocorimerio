
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBlogExcerpts() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, excerpt, content');

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  console.log(`Analisando ${posts.length} posts...\n`);

  const missing = posts.filter(p => !p.excerpt || p.excerpt.trim() === "");

  if (missing.length === 0) {
    console.log("✅ Todos os posts têm resumo!");
  } else {
    console.log(`❌ ${missing.length} posts estão sem resumo:\n`);
    missing.forEach(p => {
      console.log(`- ${p.title} (ID: ${p.id})`);
    });
  }
}

checkBlogExcerpts();
