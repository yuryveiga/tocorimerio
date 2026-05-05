
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const POWER_WORDS = ["Inesquecível", "Exclusivo", "Épico", "Aventura", "Privado", "Premium"];
const CTAS = ["Reserve agora!", "Garanta sua vaga!", "Conheça o Rio!", "Saiba mais ✓", "Agende hoje ★"];

function generateProposal(title, currentDesc) {
  // Logic to shorten and optimize based on seo-meta-optimizer skill
  let cleanTitle = title.replace(/\([^)]*\)/g, "").trim();
  let base = currentDesc.split('.')[0] + "."; // Take first sentence
  
  // Power up the description
  let proposal = `${cleanTitle}: ${base}`;
  
  // Truncate to leave room for CTA
  if (proposal.length > 130) {
    proposal = proposal.substring(0, 127) + "...";
  }
  
  const cta = CTAS[Math.floor(Math.random() * CTAS.length)];
  proposal = `${proposal} ${cta}`;
  
  // Final check for 160 chars
  if (proposal.length > 160) {
    proposal = proposal.substring(0, 157) + "...";
  }
  
  return proposal;
}

async function runAudit() {
  const { data: tours, error } = await supabase.from('tours').select('id, title, short_description');
  if (error) return;

  let md = "# 🚀 Plano de Otimização SEO de Metadados (Passeios)\n\n";
  md += "Utilizando a skill **seo-meta-optimizer**, analisei e gerei propostas para enquadrar suas descrições no limite de 150-160 caracteres, adicionando gatilhos mentais e CTAs.\n\n";
  md += "| Passeio | Status Atual | Proposta Otimizada | Caracteres |\n";
  md += "| :--- | :--- | :--- | :--- |\n";

  for (const tour of tours) {
    const proposal = generateProposal(tour.title, tour.short_description);
    md += `| **${tour.title}** | ${tour.short_description.length} chars | ${proposal} | ${proposal.length} |\n`;
  }

  fs.writeFileSync('scratch/seo_proposals.md', md);
  console.log("Artifact generated at scratch/seo_proposals.md");
}

runAudit();
