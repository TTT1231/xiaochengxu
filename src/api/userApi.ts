import { useEnvConfig } from '../hooks/useEnvConfig';
import { supabaseClient } from '@/utils/supabaseClient';
import type { Users, Credits } from '@/types';

const envConfig = useEnvConfig();

interface LoginSuccessResponse {
   success: true;
   message: string;
   data: {
      openid: string;
      isNewUser: boolean;
      accessToken: string;
      refreshToken: string;
   };
}

interface LoginFailResponse {
   success: false;
   message: string;
   errcode?: number;
}

type LoginResponse = LoginSuccessResponse | LoginFailResponse;

export interface UserProfile {
   user: Users;
   credits: Credits | null;
}

export async function login(code: string): Promise<LoginResponse> {
   if (!code?.trim()) return { success: false, message: '缺少code参数' };

   // 使用 uni.request 直接调用 Edge Function（绕过 supabase client 的兼容性问题）
   return new Promise(resolve => {
      uni.request({
         url: `${envConfig.supabaseUrl}/functions/v1/wx-login`,
         method: 'POST',
         header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${envConfig.supabasePublishableKey}`,
         },
         data: { code },
         success: res => {
            if (res.statusCode === 200) {
               resolve(res.data as LoginResponse);
            } else {
               resolve({
                  success: false,
                  message: `请求失败: ${res.statusCode}`,
               });
            }
         },
         fail: err => {
            resolve({
               success: false,
               message: err.errMsg ?? '网络请求失败',
            });
         },
      });
   });
}

export async function getUserProfile(openid: string): Promise<UserProfile> {
   const client = supabaseClient.getClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const db = client as any;

   const { data: userData, error: userError } = await db
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();

   if (userError) {
      throw new Error(`获取用户信息失败: ${userError.message}`);
   }

   const { data: creditsData } = await db
      .from('credits')
      .select('*')
      .eq('users_id', openid)
      .single();

   return {
      user: userData as unknown as Users,
      credits: creditsData ? (creditsData as unknown as Credits) : null,
   };
}
