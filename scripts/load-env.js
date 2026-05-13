import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

function parseEnvFile(filePath) {
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

export async function loadEnv() {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return;
  }

  try {
    const dotenv = await import('dotenv');
    if (fs.existsSync(envPath)) {
      const cfg = dotenv.default?.config || dotenv.config;
      if (cfg) cfg({ path: envPath });
    }
  } catch { /* dotenv não disponível */ }

  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    parseEnvFile(envPath);
    try {
      if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
        process.loadEnvFile(envPath);
      }
    } catch { /* ignore */ }
  }
}
