import { createClient } from 'supabase-wechat-stable-v2';

class SupabaseClient {
   private supabaseUrl: string;
   private supabaseKey: string;
   private client: ReturnType<typeof createClient>;

   constructor(supabaseUrl: string, supabaseKey: string) {
      this.supabaseUrl = supabaseUrl;
      this.supabaseKey = supabaseKey;
      this.client = createClient(this.supabaseUrl, this.supabaseKey);
   }
   getClient(): ReturnType<typeof createClient> {
      return this.client;
   }
}

export const supabaseClient = new SupabaseClient(
   import.meta.env.VITE_SUPABASE_URL,
   import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
).getClient();
