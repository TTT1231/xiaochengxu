interface CloudConfig {
   cloudEnvId: string;
   cloudStoragePrefix: string;
}

export function useEnvConfig(): CloudConfig {
   return {
      cloudEnvId: import.meta.env.VITE_CLOUD_ENV_ID,
      cloudStoragePrefix: import.meta.env.VITE_CLOUD_STORAGE_PREFIX,
   };
}
