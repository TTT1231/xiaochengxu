import { createClient } from 'supabase-wechat-stable-v2';
import type { PostgrestResponse } from 'supabase-wechat-stable-v2';

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

   /**
    * @description 通用查询方法 - 查询表所有数据
    * @template T - data默认返回T[]
    */
   async query<T>(table: string): Promise<PostgrestResponse<T>> {
      return (await this.client.from(table).select('*')) as unknown as PostgrestResponse<T>;
   }
}

export const supabaseClient = new SupabaseClient(
   import.meta.env.VITE_SUPABASE_URL,
   import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
