export function useEnvConfig() {
   return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
      supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
   } as const;
}
