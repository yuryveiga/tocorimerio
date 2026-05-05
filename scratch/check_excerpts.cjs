
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using the publishable key as anon key

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBlogExcerpts() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt');

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
  } catch (err) {
    console.error("Critical error:", err);
  }
}

checkBlogExcerpts();
