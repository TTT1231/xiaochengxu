import { spawn, execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';

const PROJECT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_PATH = join(PROJECT_DIR, 'dist', 'dev', 'mp-weixin');
const CLI_FILENAME = 'cli.bat';

function resolveCliPath() {
   if (process.env.WECHAT_DEVTOOLS_CLI) {
      return process.env.WECHAT_DEVTOOLS_CLI;
   }

   const candidates = [
      join('D:/soft/Tencent', 'wei-chat-devtools', CLI_FILENAME),
      join(homedir(), 'AppData/Local/Programs/Tencent/微信web开发者工具', CLI_FILENAME),
   ];

   for (const p of candidates) {
      if (existsSync(p)) return p;
   }

   try {
      const output = execSync(
         'reg query "HKCU\\Software\\Tencent\\微信web开发者工具" /v InstallPath 2>nul || reg query "HKLM\\Software\\Tencent\\微信web开发者工具" /v InstallPath 2>nul',
         { encoding: 'utf-8', windowsHide: true },
      );
      const match = output.match(/InstallPath\s+REG_SZ\s+(.+)/);
      if (match?.[1]?.trim()) {
         const regPath = match[1].trim().replace(/\\/g, '/') + '/' + CLI_FILENAME;
         if (existsSync(regPath)) return regPath;
      }
   } catch {
      // registry query failed, skip
   }

   return null;
}

const CLI_PATH = resolveCliPath();

if (!CLI_PATH) {
   console.error(
      'Error: WeChat DevTools CLI not found.\n' +
         'Set WECHAT_DEVTOOLS_CLI env var, e.g.:\n' +
         '  set WECHAT_DEVTOOLS_CLI=D:/Tencent/wechat-dev-tools/cli.bat',
   );
   process.exit(1);
}

function runCli(args) {
   return new Promise((resolve, reject) => {
      const proc = spawn('cmd', ['/c', CLI_PATH, ...args], {
         stdio: 'inherit',
         windowsHide: false,
      });
      proc.on('close', code => {
         if (code === 0) return resolve();
         reject(new Error(`exit code ${code}`));
      });
      proc.on('error', reject);
   });
}

function injectEnv() {
   const envPath = resolve(PROJECT_DIR, '.env');
   if (existsSync(envPath)) {
      for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
         const trimmed = line.trim();
         if (!trimmed || trimmed.startsWith('#')) continue;
         const eqIndex = trimmed.indexOf('=');
         if (eqIndex === -1) continue;
         const key = trimmed.slice(0, eqIndex).trim();
         const value = trimmed.slice(eqIndex + 1).trim();
         if (!process.env[key]) process.env[key] = value;
      }
   }

   const REPLACEMENTS = { YOUR_WEIXIN_APPID: 'VITE_WEIXIN_APPID' };
   const files = [
      resolve(PROJECT_DIR, 'src', 'manifest.json'),
      resolve(PROJECT_DIR, 'src', 'project.config.json'),
   ];

   for (const filePath of files) {
      let raw = readFileSync(filePath, 'utf-8');
      let changed = false;

      for (const [placeholder, envKey] of Object.entries(REPLACEMENTS)) {
         const value = process.env[envKey];
         if (!value) continue;
         const pattern = `"${placeholder}"`;
         if (raw.includes(pattern)) {
            raw = raw.replace(pattern, `"${value}"`);
            console.log(`[inject-env] ${filePath} ${placeholder} → ${value}`);
            changed = true;
         }
      }

      if (changed) writeFileSync(filePath, raw, 'utf-8');
   }
}

function dev() {
   injectEnv();

   return new Promise((resolve, reject) => {
      const buildProc = spawn('uni', ['-p', 'mp-weixin'], {
         cwd: PROJECT_DIR,
         stdio: ['ignore', 'pipe', 'pipe'],
         shell: true,
      });

      const cleanup = () => {
         buildProc.kill();
         process.exit(0);
      };
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      console.log('[1/2] Compiling uni-app (dev:mp-weixin)...');

      let compiled = false;

      buildProc.stdout.on('data', data => {
         const msg = data.toString();
         process.stdout.write(msg);

         if (!compiled && (msg.includes('ready in') || msg.includes('watching'))) {
            compiled = true;
            console.log('\n[2/2] Opening WeChat DevTools...');
            runCli(['open', '--project', DIST_PATH]);
         }
      });

      buildProc.stderr.on('data', data => {
         process.stderr.write(data);
      });

      buildProc.on('error', err => {
         console.error('Build failed:', err.message);
         reject(err);
      });

      buildProc.on('close', code => {
         if (code === 0) resolve();
         else reject(new Error(`build exited with code ${code}`));
      });
   });
}

async function stop() {
   await runCli(['close', '--project', DIST_PATH]);
}

const command = process.argv[2];

if (!command || !{ dev, stop }[command]) {
   console.log('Usage: node dev.mjs <command>');
   console.log('Commands:');
   console.log('  dev    Compile and open in WeChat DevTools');
   console.log('  stop   Close project in WeChat DevTools');
   process.exit(1);
}

const commands = { dev, stop };
commands[command]().catch(err => {
   console.error('Error:', err.message);
   process.exit(1);
});
