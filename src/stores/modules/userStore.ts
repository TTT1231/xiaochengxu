import { defineStore } from 'pinia';
import {
   cloudLogin,
   getCloudProfile,
   updateCloudProfile,
   rechargeWallet,
   redeemVipCard,
} from '@/api/userApi';
import type { UpdateProfileParams, RedeemVipCardResult } from '@/api/userApi';
import type { Users, Wallets } from '@/types';

interface AuthState {
   openid: string;
   isLoggedIn: boolean;
   isLoading: boolean;
   cloudReady: boolean;
   user: Users | null;
   wallet: Wallets | null;
}

interface LoginResult {
   success: boolean;
   message: string;
   isNewUser?: boolean;
}

export const useUserStore = defineStore('user', {
   state: (): AuthState => ({
      openid: '',
      isLoggedIn: false,
      isLoading: false,
      cloudReady: false,
      user: null,
      wallet: null,
   }),

   getters: {
      isAuthenticated: state => state.isLoggedIn,
      isVip: state => (state.wallet?.total_recharged ?? 0) > 0,
   },

   actions: {
      async init(): Promise<void> {
         this.cloudReady = true;
         try {
            await this.login();
         } catch {
            // init 阶段登录失败不阻断应用
         }
      },

      async login(): Promise<LoginResult> {
         this.isLoading = true;
         try {
            const result = await cloudLogin();
            if (!result.success) {
               return { success: false, message: result.message };
            }

            if (!result.data) {
               return { success: false, message: '登录返回数据异常' };
            }

            const { user, wallet, isNewUser } = result.data;
            this.user = user;
            this.wallet = wallet;
            this.openid = user._id;
            this.isLoggedIn = true;

            return { success: true, message: result.message, isNewUser };
         } catch (error) {
            return {
               success: false,
               message: error instanceof Error ? error.message : '登录失败',
            };
         } finally {
            this.isLoading = false;
         }
      },

      logout(): void {
         this.openid = '';
         this.isLoggedIn = false;
         this.user = null;
         this.wallet = null;
      },

      async fetchProfile(): Promise<void> {
         try {
            const profile = await getCloudProfile();
            if (profile) {
               this.user = profile.user;
               this.wallet = profile.wallet;
            }
         } catch {
            // fetchProfile 常在 onShow 高频调用，静默失败避免干扰用户
         }
      },

      async updateUserProfile(
         params: UpdateProfileParams,
      ): Promise<{ success: boolean; message: string }> {
         try {
            const result = await updateCloudProfile(params);
            if (result.success && this.user) {
               this.user = {
                  ...this.user,
                  ...(params.phone !== undefined ? { phone: params.phone } : {}),
                  ...(params.address !== undefined ? { address: params.address } : {}),
               };
            }
            return result;
         } catch (error) {
            return {
               success: false,
               message: error instanceof Error ? error.message : '更新失败',
            };
         }
      },

      async recharge(amount: number): Promise<{ success: boolean; message: string }> {
         try {
            const result = await rechargeWallet(amount);
            if (result.success && result.data) {
               this.wallet = result.data.wallet as Wallets;
            }
            return result;
         } catch (error) {
            return {
               success: false,
               message: error instanceof Error ? error.message : '充值失败',
            };
         }
      },

      async redeemVipCard(cardNo: string): Promise<RedeemVipCardResult> {
         try {
            const result = await redeemVipCard(cardNo);
            if (result.success && result.data) {
               this.wallet = result.data.wallet as Wallets;
            }
            return result;
         } catch (error) {
            return {
               success: false,
               message: error instanceof Error ? error.message : '兑换失败',
            };
         }
      },
   },
});
