import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Tenta carregar variáveis do .env de forma robusta
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      // Remove aspas simples ou duplas ao redor
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.warn('Aviso: não foi possível fazer parse manual do .env:', e.message);
  }
}

// 1. Se já existirem no ambiente (CI/GitHub Actions), não precisa fazer nada
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  // 2. Tentar dotenv se disponível
  try {
    const dotenv = await import('dotenv');
    if (fs.existsSync(envPath)) {
      dotenv.default?.config?.({ path: envPath }) || dotenv.config?.({ path: envPath });
    }
  } catch {
    /* dotenv não disponível, seguir para fallback */
  }
}

// 3. Fallback: parse manual do .env
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  loadEnvFile(envPath);
  // Tentar também process.loadEnvFile nativo
  try {
    if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  } catch { /* ignore */ }
}

// Configurações do Supabase local (Tocorime)
const LOCAL_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const LOCAL_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!LOCAL_SUPABASE_URL || !LOCAL_SUPABASE_ANON_KEY) {
  console.error("ERRO: Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não encontradas.");
  console.error("");
  console.error("Possíveis causas e soluções:");
  console.error("  • Local: crie um arquivo .env na raiz do projeto com:");
  console.error("      VITE_SUPABASE_URL=https://...");
  console.error("      VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...");
  console.error("  • GitHub Actions: configure os Secrets do repositório:");
  console.error("      VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY");
  console.error("      em Settings > Secrets and variables > Actions");
  process.exit(1);
}

// Cliente do parceiro para pegar a lista básica de jogos
const PARTNER_PROJECT_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const PARTNER_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";

const partnerSupabase = createClient(PARTNER_PROJECT_URL, PARTNER_ANON_KEY);

// Função para mapear o título do quadro para o campo do banco
const mapBoxToField = (title) => {
  const map = {
    'INCLUDES': 'included_json',
    'NOT INCLUDED': 'not_included_json',
    'BRING': 'bring_json',
    "DON'T BRING": 'dont_bring_json',
    'ATTENTION': 'attention_json',
    'NOT SUITABLE FOR': 'not_suitable_json'
  };
  return map[title] || null;
};

async function syncMatches() {
  console.log("Iniciando sincronização de jogos...");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // 1. Pegar jogos do parceiro
  const { data: matches, error } = await partnerSupabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error("Erro ao buscar jogos do parceiro:", error.message);
    await browser.close();
    return;
  }

  console.log(`Encontrados ${matches.length} jogos. Iniciando raspagem de detalhes...`);

  const localSupabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY);

  for (const match of matches) {
    const slug = match.slug || match.id;
    const url = `https://maracanamatchday.com/match/${slug}`;
    console.log(`Sincronizando: ${match.home_team} x ${match.away_team} (${url})`);

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

      // Clicar no seletor de pacotes para carregar os preços
      const selectPackageBtn = page.locator('text=Select your package here').first();
      if (await selectPackageBtn.isVisible()) {
        await selectPackageBtn.click();
        await page.waitForTimeout(1000);
      }

      // Extrair setores e preços
      const sectors = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('label[for^="sector-"]'));
        return items.map(item => {
          const title = item.querySelector('span.font-bold')?.innerText || "";
          const priceText = item.querySelector('span.font-black')?.innerText || "0";
          const price = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim());
          return { title, price };
        });
      });

      // Extrair quadros informativos
      const infoBoxes = await page.evaluate(() => {
        const boxes = Array.from(document.querySelectorAll('div.bg-muted\\/30.rounded-3xl'));
        return boxes.map(box => {
          const title = box.querySelector('h3')?.innerText || "";
          const items = Array.from(box.querySelectorAll('li')).map(li => ({ text: li.innerText }));
          return { title, items };
        });
      });

      // Preparar dados para atualização (apenas colunas que existem no nosso banco)
      const updateData = {
        id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        match_date: match.match_date,
        venue: match.venue,
        stadium: match.stadium,
        competition: match.competition,
        slug: match.slug,
        status: match.status,
        price: match.price,
        price_premium: match.price_premium,
        available_spots: match.available_spots,
        sold_count: match.sold_count,
        home_team_logo: match.home_team_logo,
        away_team_logo: match.away_team_logo,
        image_url: match.image_url,
        high_demand: match.high_demand,
        includes_guide: match.includes_guide,
        includes_ticket: match.includes_ticket,
        includes_transfer: match.includes_transfer,
        custom_options_json: sectors,
        updated_at: new Date().toISOString()
      };

      // Mapear quadros para campos
      infoBoxes.forEach(box => {
        const fieldMap = {
          'INCLUDES': 'included_json',
          'NOT INCLUDED': 'not_included_json',
          'BRING': 'bring_json',
          "DON'T BRING": 'dont_bring_json',
          'ATTENTION': 'attention_json',
          'NOT SUITABLE FOR': 'not_suitable_json'
        };
        const field = fieldMap[box.title];
        if (field) {
          updateData[field] = box.items;
        }
      });

      // 2. Atualizar no Supabase local
      const { error: upsertError } = await localSupabase
        .from('matches')
        .upsert(updateData, { onConflict: 'slug' });

      if (upsertError) {
        console.error(`Erro ao salvar jogo ${slug}:`, upsertError.message);
      } else {
        console.log(`Jogo ${slug} sincronizado com sucesso!`);
      }

    } catch (e) {
      console.error(`Erro ao processar ${slug}:`, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("Sincronização concluída!");
}

syncMatches();
