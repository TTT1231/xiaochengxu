import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

interface AdminLoginParams {
   username: string;
   password: string;
}

interface AdminDoc {
   _id: string;
   username: string;
   password: string;
   authorized_openids?: string[];
}

/** 管理员登录云函数 */
export async function main(
   event: AdminLoginParams,
): Promise<{ success: boolean; message: string }> {
   const { username, password } = event;

   if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
   }

   try {
      const res = await db.collection('admins').where({ username }).limit(1).get();

      const admins = res.data as unknown as AdminDoc[];

      if (admins.length === 0) {
         return { success: false, message: '用户名或密码错误' };
      }

      const admin = admins[0];

      if (admin.password !== password) {
         return { success: false, message: '用户名或密码错误' };
      }

      return { success: true, message: '登录成功' };
   } catch (error) {
      console.error('admin-login error:', error);
      return { success: false, message: '登录验证失败，请稍后重试' };
   }
}
