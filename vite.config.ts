import { defineConfig, type Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { existsSync, readdirSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

/** Recursively compile weixin-cloud/ directory into dist output.
 *  Each cloud function is at weixin-cloud/<name>/index.ts
 *  and compiles to dist/dev/mp-weixin/weixin-cloud/<name>/index.js */
function compileWeixinCloud(): Plugin {
   return {
      name: 'compile-weixin-cloud',
      async closeBundle() {
         const cloudDir = join(process.cwd(), 'weixin-cloud');
         const outDir = join(process.cwd(), 'dist', 'dev', 'mp-weixin', 'weixin-cloud');
         if (!existsSync(cloudDir)) return;

         mkdirSync(outDir, { recursive: true });
         // @ts-expect-error esbuild is a transitive dependency of Vite
         const { transformSync } = await import('esbuild');

         function processDirectory(dir: string) {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
               const srcPath = join(dir, entry.name);
               if (entry.isDirectory()) {
                  processDirectory(srcPath);
               } else if (entry.isFile()) {
                  const ext = extname(entry.name);
                  const relPath = relative(cloudDir, srcPath);

                  if (ext === '.ts') {
                     const result = transformSync(readFileSync(srcPath, 'utf-8'), {
                        loader: 'ts',
                        target: 'es2020',
                        format: 'cjs',
                     });
                     const outPath = join(outDir, relPath.replace(/\.ts$/, '.js'));
                     mkdirSync(join(outPath, '..'), { recursive: true });
                     writeFileSync(outPath, result.code);
                  } else {
                     const outPath = join(outDir, relPath);
                     mkdirSync(join(outPath, '..'), { recursive: true });
                     cpSync(srcPath, outPath);
                  }
               }
            }
         }

         processDirectory(cloudDir);
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
