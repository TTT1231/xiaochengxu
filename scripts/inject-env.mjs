import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

// Parse .env file manually (no dotenv dependency needed)
const ENV_PATH = resolve(PROJECT_DIR, '.env');
if (existsSync(ENV_PATH)) {
   for (const line of readFileSync(ENV_PATH, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
         process.env[key] = value;
      }
   }
}

const TARGET_FILES = [
   resolve(PROJECT_DIR, 'src', 'manifest.json'),
   resolve(PROJECT_DIR, 'src', 'project.config.json'),
];

// Placeholder → env var mapping
const REPLACEMENTS = {
   YOUR_WEIXIN_APPID: 'VITE_WEIXIN_APPID',
};

function injectEnv() {
   let anyChanged = false;

   for (const filePath of TARGET_FILES) {
      let raw = readFileSync(filePath, 'utf-8');
      let changed = false;

      for (const [placeholder, envKey] of Object.entries(REPLACEMENTS)) {
         const value = process.env[envKey];
         if (!value) {
            console.warn(`[inject-env] skip: ${envKey} not set`);
            continue;
         }

         const pattern = `"${placeholder}"`;
         if (raw.includes(pattern)) {
            raw = raw.replace(pattern, `"${value}"`);
            changed = true;
            console.log(`[inject-env] ${placeholder} → ${value}`);
         }
      }

      if (changed) {
         writeFileSync(filePath, raw, 'utf-8');
         anyChanged = true;
      }
   }

   if (anyChanged) {
      console.log('[inject-env] files updated');
   } else {
      console.log('[inject-env] no changes needed');
   }
}

try {
   injectEnv();
} catch (error) {
   console.error('[inject-env] failed:', error.message);
   process.exit(1);
}
