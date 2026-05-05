
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase.from('tours').select('*').limit(1);
  if (data && data[0]) {
    console.log("Colunas da tabela tours:", Object.keys(data[0]));
  } else {
    console.log("Nenhum dado encontrado ou erro:", error);
  }
}

checkColumns();
