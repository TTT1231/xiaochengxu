import { useEnvConfig } from '../hooks/useEnvConfig';

const envConfig = useEnvConfig();

// 成功响应
interface LoginSuccessResponse {
   success: true;
   message: string;
   data: {
      openid: string;
      isNewUser: boolean;
      /** supabase jwt auth access token */
      accessToken: string;
      /** supabase jwt refresh token */
      refreshToken: string;
   };
}

// 失败响应
interface LoginFailResponse {
   success: false;
   message: string;
   errcode?: number;
}

type LoginResponse = LoginSuccessResponse | LoginFailResponse;

/**
 * 微信登录接口
 * @param code - 微信登录凭证
 * @returns 登录/注册结果，包含 openid、accessToken、refreshToken
 */
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
