import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const PROJECT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_PATH = join(PROJECT_DIR, 'dist', 'dev', 'mp-weixin');
const CLI_FILENAME = 'cli.bat';

function resolveCliPath() {
   if (process.env.WECHAT_DEVTOOLS_CLI) {
      return process.env.WECHAT_DEVTOOLS_CLI;
   }

   const candidates = [
      'D:/Tencent/wechat-dev-tools/' + CLI_FILENAME,
      'C:/Tencent/wechat-dev-tools/' + CLI_FILENAME,
      'D:/Program Files/Tencent/微信web开发者工具/' + CLI_FILENAME,
      'C:/Program Files/Tencent/微信web开发者工具/' + CLI_FILENAME,
      'C:/Program Files (x86)/Tencent/微信web开发者工具/' + CLI_FILENAME,
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
      proc.on('close', (code) => {
         if (code === 0) return resolve();
         reject(new Error(`exit code ${code}`));
      });
      proc.on('error', reject);
   });
}

function dev() {
   const buildProc = spawn('pnpm', ['dev:mp-weixin'], {
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

   buildProc.stdout.on('data', (data) => {
      const msg = data.toString();
      process.stdout.write(msg);

      if (!compiled && (msg.includes('ready in') || msg.includes('watching'))) {
         compiled = true;
         console.log('\n[2/2] Opening WeChat DevTools...');
         runCli(['open', '--project', DIST_PATH]);
      }
   });

   buildProc.stderr.on('data', (data) => {
      process.stderr.write(data);
   });

   buildProc.on('error', (err) => {
      console.error('Build failed:', err.message);
      process.exit(1);
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
commands[command]().catch((err) => {
   console.error('Error:', err.message);
   process.exit(1);
});
