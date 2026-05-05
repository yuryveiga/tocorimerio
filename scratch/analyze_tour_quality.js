
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeTourSEO() {
  const { data: tours, error } = await supabase
    .from('tours')
    .select('id, title, short_description');

  if (error) {
    console.error("Error fetching tours:", error);
    return;
  }

  console.log(`\n📊 Analisando Qualidade de SEO em ${tours.length} passeios...\n`);

  const report = tours.map(tour => {
    const desc = tour.short_description || "";
    const length = desc.length;
    let quality = "Boa";
    let issues = [];

    if (length < 100) {
      quality = "Melhorável";
      issues.push(`Muito curta (${length} caracteres). O ideal é > 140.`);
    } else if (length > 165) {
      quality = "Melhorável";
      issues.push(`Muito longa (${length} caracteres). Será cortada pelo Google.`);
    }

    if (!/reserve|conheça|descubra|agende|venha/i.test(desc)) {
      issues.push("Falta um Call to Action (ex: 'Reserve agora', 'Descubra...')");
    }

    return {
      title: tour.title,
      length,
      quality,
      issues
    };
  });

  report.forEach(item => {
    console.log(`📍 ${item.title}`);
    console.log(`   Status: ${item.quality} (${item.length} chars)`);
    if (item.issues.length > 0) {
      item.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
    console.log("");
  });
}

analyzeTourSEO();
