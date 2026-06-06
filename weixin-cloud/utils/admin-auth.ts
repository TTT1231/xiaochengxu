import { db } from './database';

/**
 * Fail-closed administrator authorization.
 *
 * The admin app calls cloud functions via the WeChat HTTP API (not as a
 * Mini Program), so `cloud.getWXContext().OPENID` is unavailable.  Instead,
 * the caller supplies `adminOpenId` in the request event, and this function
 * verifies it against the `authorized_openids` array stored in the
 * `admins` config document (`{ _id: 'admin_config', authorized_openids: string[] }`).
 *
 * Returns the verified identity on success.
 * Throws `AuthorizationError` on any failure.
 */
export class AuthorizationError extends Error {
   constructor(reason: string) {
      super(reason);
      this.name = 'AuthorizationError';
   }
}

export async function authorizeAdmin(adminOpenId: string | undefined): Promise<string> {
   if (!adminOpenId) {
      throw new AuthorizationError('缺少管理员身份标识');
   }

   try {
      const { data } = await db.collection('admins').doc('admin_config').get();

      const config = data as { authorized_openids?: string[] } | null;
      const allowed: string[] = config?.authorized_openids ?? [];

      if (!allowed.includes(adminOpenId)) {
         throw new AuthorizationError('无管理员权限');
      }

      return adminOpenId;
   } catch (error) {
      // Re-throw our own authorization errors
      if (error instanceof AuthorizationError) throw error;

      // Any database / config error → fail closed
      throw new AuthorizationError('管理员身份验证失败');
   }
}
