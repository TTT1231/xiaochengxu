import type { Users, Wallets } from '@/types';

export interface UserProfile {
   user: Users;
   wallet: Wallets | null;
}

export interface CloudLoginResult {
   success: boolean;
   message: string;
   data?: {
      user: Users;
      wallet: Wallets;
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
         data?: { user: Users; wallet: Wallets };
         message: string;
      };
      if (result.success && result.data) {
         return { user: result.data.user, wallet: result.data.wallet ?? null };
      }
      return null;
   } catch {
      return null;
   }
}

export interface UpdateProfileParams {
   name?: string;
   phone?: string;
   [key: string]: unknown;
}

export interface UpdateProfileResult {
   success: boolean;
   message: string;
}

export async function updateCloudProfile(
   params: UpdateProfileParams,
): Promise<UpdateProfileResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'update-profile', data: params });
      return res.result as UpdateProfileResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '更新失败',
      };
   }
}

export interface RechargeResult {
   success: boolean;
   message: string;
   data?: { wallet: Wallets };
}

export async function rechargeWallet(amount: number): Promise<RechargeResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'recharge', data: { amount } });
      return res.result as RechargeResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '充值失败',
      };
   }
}

export interface RedeemVipCardResult {
   success: boolean;
   message: string;
   data?: { amount: number; wallet: Wallets };
}

export async function redeemVipCard(cardNo: string): Promise<RedeemVipCardResult> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'redeem-vip-card',
         data: { card_no: cardNo },
      });
      return res.result as RedeemVipCardResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '兑换失败',
      };
   }
}
