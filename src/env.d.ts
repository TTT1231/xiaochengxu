/// <reference types="vite/client" />

interface ImportMetaEnv {
   readonly VITE_WEIXIN_APPID: string;
   readonly VITE_WEIXIN_CLOUD_ID: string;
   readonly VITE_CLOUD_STORAGE_PREFIX: string;
}

interface ImportMeta {
   readonly env: ImportMetaEnv;
}

declare module '*.vue' {
   import type { DefineComponent } from 'vue';
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const component: DefineComponent<{}, {}, any>;
   export default component;
}
