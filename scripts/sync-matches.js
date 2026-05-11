import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import fs from 'fs';

// Tenta carregar o .env se o arquivo existir (Node 20.12+)
// Em CI (GitHub Actions), as variáveis já estão no ambiente
if (fs.existsSync('.env')) {
  try {
    // eslint-disable-next-line no-undef
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile('.env');
    }
  } catch (e) {
    console.warn("Aviso: Não foi possível carregar o arquivo .env automaticamente.", e.message);
  }
}

// Configurações do Supabase local (Tocorime)
const LOCAL_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const LOCAL_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

if (!LOCAL_SUPABASE_URL || !LOCAL_SUPABASE_ANON_KEY) {
  console.error("ERRO: Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não encontradas.");
  console.log("Certifique-se de que o arquivo .env existe localmente ou que os Secrets estão configurados no GitHub.");
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

      // Preparar dados para atualização
      const updateData = {
        ...match,
        custom_options_json: sectors,
        updated_at: new Date().toISOString()
      };

      // Mapear quadros para campos
      infoBoxes.forEach(box => {
        const field = {
          'INCLUDES': 'included_json',
          'NOT INCLUDED': 'not_included_json',
          'BRING': 'bring_json',
          "DON'T BRING": 'dont_bring_json',
          'ATTENTION': 'attention_json',
          'NOT SUITABLE FOR': 'not_suitable_json'
        }[box.title];
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
