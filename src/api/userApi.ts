import type { Users, Credits } from '@/types';

export interface UserProfile {
   user: Users;
   credits: Credits | null;
}

export interface CloudLoginResult {
   success: boolean;
   message: string;
   data?: {
      user: Users;
      credits: Credits;
      isNewUser: boolean;
   };
}

export async function cloudLogin(): Promise<CloudLoginResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'user-login', timeout: 10000 });
      return res.result as CloudLoginResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '登录失败',
      };
   }
}

export async function getCloudProfile(): Promise<UserProfile | null> {
   try {
      const res = await wx.cloud.callFunction({ name: 'get-profile' });
      const result = res.result as {
         success: boolean;
         data?: { user: Users; credits: Credits };
         message: string;
      };
      if (result.success && result.data) {
         return { user: result.data.user, credits: result.data.credits ?? null };
      }
      return null;
   } catch {
      return null;
   }
}
