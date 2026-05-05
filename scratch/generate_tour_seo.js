
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
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function generateTourShortDescriptions() {
  const { data: tours, error } = await supabase
    .from('tours')
    .select('id, title, short_description, itinerary_json');

  if (error) {
    console.error("Error fetching tours:", error);
    return;
  }

  const missing = tours.filter(t => !t.short_description || t.short_description.trim() === "");

  if (missing.length === 0) {
    console.log("✅ Todos os passeios já possuem descrição curta.");
    return;
  }

  console.log(`\n🚀 Iniciando geração de descrições curtas para ${missing.length} passeios...\n`);

  let successCount = 0;

  for (const tour of missing) {
    let sourceText = "";

    // Tenta usar o itinerário para compor a descrição
    if (tour.itinerary_json && Array.isArray(tour.itinerary_json)) {
      sourceText = tour.itinerary_json
        .map(item => item.description || "")
        .join(" ");
    }

    const cleanText = stripHtml(sourceText);
    
    if (!cleanText || cleanText.length < 10) {
      console.log(`⚠️  Passeio "${tour.title}" não tem texto suficiente no itinerário para gerar descrição. Pulando...`);
      continue;
    }

    // Generate short description (max 150 chars)
    const newShortDesc = cleanText.substring(0, 150).trim() + "...";

    const { error: updateError } = await supabase
      .from('tours')
      .update({ short_description: newShortDesc })
      .eq('id', tour.id);

    if (updateError) {
      console.error(`❌ Erro ao atualizar "${tour.title}":`, updateError);
    } else {
      console.log(`✅ Descrição curta gerada para: "${tour.title}"`);
      successCount++;
    }
  }

  console.log(`\n✨ Finalizado! ${successCount} passeios foram atualizados.`);
}

generateTourShortDescriptions();
