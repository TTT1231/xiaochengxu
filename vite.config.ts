import { defineConfig, type Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { existsSync, readdirSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, extname, basename } from 'node:path';

const require = createRequire(import.meta.url);

/** Bundle each cloud function into a self-contained index.js.
 *  WeChat Cloud runs each function in isolation — shared utils via
 *  require('../utils/...') won't work. esbuild bundles all local
 *  imports into a single file per function. wx-server-sdk is marked
 *  external because it's installed from each function's package.json. */
function compileWeixinCloud(): Plugin {
   return {
      name: 'compile-weixin-cloud',
      async closeBundle() {
         const cloudDir = join(process.cwd(), 'weixin-cloud');
         const outDir = join(process.cwd(), 'dist', 'dev', 'mp-weixin', 'weixin-cloud');
         if (!existsSync(cloudDir)) return;

         mkdirSync(outDir, { recursive: true });
         const { buildSync } = require('esbuild');

         // Read shared package.json for wx-server-sdk dependency
         const pkgPath = join(cloudDir, 'package.json');
         const pkgContent = existsSync(pkgPath) ? readFileSync(pkgPath, 'utf-8') : null;

         for (const entry of readdirSync(cloudDir, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const funcDir = join(cloudDir, entry.name);
            const indexTs = join(funcDir, 'index.ts');
            if (!existsSync(indexTs)) continue;

            const funcOutDir = join(outDir, entry.name);
            mkdirSync(funcOutDir, { recursive: true });

            // Bundle: inline local imports, keep wx-server-sdk external
            buildSync({
               entryPoints: [indexTs],
               bundle: true,
               platform: 'node',
               target: 'es2020',
               format: 'cjs',
               outfile: join(funcOutDir, 'index.js'),
               external: ['wx-server-sdk'],
               minify: false,
            });

            // Copy package.json into each function dir for dependency install
            if (pkgContent) {
               writeFileSync(join(funcOutDir, 'package.json'), pkgContent);
            }
         }
      },
   };
}

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [uni(), compileWeixinCloud()],
   css: {
      preprocessorOptions: {
         scss: {
            api: 'modern-compiler',
            silenceDeprecations: ['legacy-js-api'],
         },
      },
   },
});
