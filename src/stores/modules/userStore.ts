import { defineStore } from 'pinia';
import { cloudLogin, getCloudProfile } from '@/api/userApi';
import type { Users, Credits } from '@/types';

interface AuthState {
   openid: string;
   isLoggedIn: boolean;
   isLoading: boolean;
   cloudReady: boolean;
   user: Users | null;
   credits: Credits | null;
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
      credits: null,
   }),

   getters: {
      isAuthenticated: state => state.isLoggedIn,
   },

   actions: {
      async init(): Promise<void> {
         this.cloudReady = true;
         await this.login();
      },

      async login(): Promise<LoginResult> {
         this.isLoading = true;
         try {
            const result = await cloudLogin();
            if (!result.success) {
               return { success: false, message: result.message };
            }

            const { user, credits, isNewUser } = result.data!;
            this.user = user;
            this.credits = credits;
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
         this.credits = null;
      },

      async fetchProfile(): Promise<void> {
         const profile = await getCloudProfile();
         if (profile) {
            this.user = profile.user;
            this.credits = profile.credits;
         }
      },
   },
});
