import { createClient } from 'supabase-wechat-stable-v2';
import type { PostgrestResponse } from 'supabase-wechat-stable-v2';
import { useEnvConfig } from '../hooks/useEnvConfig';

const envConfig = useEnvConfig();

class SupabaseClient {
   private supabaseUrl: string;
   private supabaseKey: string;
   private client: ReturnType<typeof createClient>;
   private accessToken: string;

   constructor(supabaseUrl: string, supabaseKey: string, accessToken: string = '') {
      this.supabaseUrl = supabaseUrl;
      this.supabaseKey = supabaseKey;
      this.accessToken = accessToken;
      this.client = createClient(this.supabaseUrl, this.supabaseKey);
   }

   getClient(): ReturnType<typeof createClient> {
      if (!this.accessToken) return this.client;
      return createClient(this.supabaseUrl, this.supabaseKey, {
         global: { headers: { Authorization: `Bearer ${this.accessToken}` } },
      });
   }
   setAccessToken(token: string) {
      this.accessToken = token;
   }
   clearAccessToken() {
      this.accessToken = '';
   }
   getAccessToken(): string {
      return this.accessToken;
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
   envConfig.supabaseUrl,
   envConfig.supabasePublishableKey,
);
