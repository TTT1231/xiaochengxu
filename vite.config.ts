import { defineConfig, loadEnv, type Plugin } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { existsSync, readdirSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

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

         for (const file of readdirSync(cloudDir, { withFileTypes: true })) {
            if (!file.isFile()) continue;
            const srcPath = join(cloudDir, file.name);
            const ext = extname(file.name);

            if (ext === '.ts') {
               const result = transformSync(readFileSync(srcPath, 'utf-8'), {
                  loader: 'ts',
                  target: 'es2020',
                  format: 'cjs',
               });
               writeFileSync(join(outDir, basename(file.name, ext) + '.js'), result.code);
            } else {
               cpSync(srcPath, join(outDir, file.name));
            }
         }
      },
   };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd());

   return {
      plugins: [uni(), compileWeixinCloud()],
      css: {
         preprocessorOptions: {
            scss: {
               api: 'modern-compiler',
               silenceDeprecations: ['legacy-js-api'],
            },
         },
      },
      define: {
         // uni-app 小程序需要将整个 import.meta.env 对象替换
         'import.meta.env': JSON.stringify({
            VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
            VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY,
         }),
      },
   };
});
