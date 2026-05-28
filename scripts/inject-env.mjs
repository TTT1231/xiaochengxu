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
   '<appid>': 'VITE_WEIXIN_APPID',
};

function injectEnv() {
   const originals = new Map();

   for (const filePath of TARGET_FILES) {
      const raw = readFileSync(filePath, 'utf-8');
      let modified = raw;
      let changed = false;

      for (const [placeholder, envKey] of Object.entries(REPLACEMENTS)) {
         const value = process.env[envKey];
         if (!value) {
            console.warn(`[inject-env] skip: ${envKey} not set`);
            continue;
         }

         const pattern = `"${placeholder}"`;
         if (modified.includes(pattern)) {
            modified = modified.replace(pattern, `"${value}"`);
            changed = true;
            console.log(`[inject-env] ${placeholder} → ${value}`);
         }
      }

      if (changed) {
         originals.set(filePath, raw);
         writeFileSync(filePath, modified, 'utf-8');
      }
   }

   if (originals.size > 0) {
      console.log('[inject-env] files updated');
   } else {
      console.log('[inject-env] no changes needed');
   }

   return () => {
      for (const [filePath, original] of originals) {
         writeFileSync(filePath, original, 'utf-8');
      }
   };
}

try {
   const restore = injectEnv();
   process.on('exit', restore);
   process.on('SIGINT', () => { restore(); process.exit(0); });
} catch (error) {
   console.error('[inject-env] failed:', error.message);
   process.exit(1);
}
