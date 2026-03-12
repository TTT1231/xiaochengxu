import { defineStore } from 'pinia';
import { login as wxLogin } from '@/api/userApi';
import { supabaseClient } from '@/utils/supabaseClient';

interface AuthState {
   accessToken: string;
   refreshToken: string;
   openid: string;
   isLoggedIn: boolean;
   isLoading: boolean;
}

interface LoginResult {
   success: boolean;
   message: string;
   isNewUser?: boolean;
}

interface JwtPayload {
   exp?: number;
}

const TOKEN_KEY = 'wx_access_token';
const REFRESH_TOKEN_KEY = 'wx_refresh_token';
const OPENID_KEY = 'wx_openid';

const TOKEN_EXPIRY_BUFFER_SECONDS = 60; // 提前 60 秒视为过期
const TOKEN_REFRESH_THRESHOLD_SECONDS = 300; // 剩余 5 分钟时刷新

/** 清除所有认证相关存储 */
function clearAuthStorage(): void {
   uni.removeStorageSync(TOKEN_KEY);
   uni.removeStorageSync(REFRESH_TOKEN_KEY);
   uni.removeStorageSync(OPENID_KEY);
}

/** 解析 JWT payload，失败返回 null */
function parseJwtPayload(token: string): JwtPayload | null {
   try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      return JSON.parse(atob(payload)) as JwtPayload;
   } catch {
      return null;
   }
}

/** 获取 token 剩余有效秒数，无效返回 0 */
function getTokenRemainingSeconds(token: string): number {
   const payload = parseJwtPayload(token);
   if (!payload?.exp) return 0;
   return Math.max(0, payload.exp - Date.now() / 1000);
}

/** 检查 token 是否已过期（提前 60 秒视为过期） */
function isTokenExpired(token: string): boolean {
   return getTokenRemainingSeconds(token) < TOKEN_EXPIRY_BUFFER_SECONDS;
}

/** 检查 token 是否即将过期（剩余 < 5 分钟） */
function isTokenExpiringSoon(token: string): boolean {
   return getTokenRemainingSeconds(token) < TOKEN_REFRESH_THRESHOLD_SECONDS;
}

export const useUserStore = defineStore('user', {
   state: (): AuthState => ({
      accessToken: '',
      refreshToken: '',
      openid: '',
      isLoggedIn: false,
      isLoading: false,
   }),

   getters: {
      /** 是否已认证（有有效 token） */
      isAuthenticated: state => Boolean(state.accessToken && state.isLoggedIn),
   },

   actions: {
      /** 初始化认证状态，恢复登录态或静默登录 */
      async init(): Promise<void> {
         const token = uni.getStorageSync(TOKEN_KEY) as string;
         const refreshToken = uni.getStorageSync(REFRESH_TOKEN_KEY) as string;
         const openid = uni.getStorageSync(OPENID_KEY) as string;

         if (token && refreshToken && openid && !isTokenExpired(token)) {
            this.accessToken = token;
            this.refreshToken = refreshToken;
            this.openid = openid;
            this.isLoggedIn = true;
            supabaseClient.setAccessToken(token);
            return;
         }

         // 凭证不完整或过期，清理后静默登录
         if (token || refreshToken || openid) {
            clearAuthStorage();
         }
         await this.loginWithWeChat();
      },

      /** 微信授权登录完整流程：wx.login -> Edge Function -> 持久化 */
      async loginWithWeChat(): Promise<LoginResult> {
         this.isLoading = true;
         try {
            const code = await new Promise<string>((resolve, reject) => {
               uni.login({
                  provider: 'weixin',
                  success: res => resolve(res.code),
                  fail: err => reject(new Error(err.errMsg ?? '微信登录失败')),
               });
            });

            const result = await wxLogin(code);
            if (!result.success) {
               return { success: false, message: result.message };
            }

            const { accessToken, openid, isNewUser, refreshToken } = result.data;

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.openid = openid;
            this.isLoggedIn = true;
            supabaseClient.setAccessToken(accessToken);

            uni.setStorageSync(TOKEN_KEY, accessToken);
            uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken);
            uni.setStorageSync(OPENID_KEY, openid);

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

      /** 退出登录，清除所有凭证 */
      logout(): void {
         this.accessToken = '';
         this.refreshToken = '';
         this.openid = '';
         this.isLoggedIn = false;
         supabaseClient.clearAccessToken();
         clearAuthStorage();
      },

      /** 静默刷新 token，失败不抛异常 */
      async refreshTokenIfNeeded(): Promise<void> {
         if (!this.accessToken || isTokenExpiringSoon(this.accessToken)) {
            await this.loginWithWeChat();
         }
      },
   },
});
