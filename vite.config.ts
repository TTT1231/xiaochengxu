import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd());

   return {
      plugins: [uni()],
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
