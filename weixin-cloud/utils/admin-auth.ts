import { db } from './database';

/**
 * Fail-closed administrator authorization.
 *
 * Checks the supplied `adminOpenId` against all admin documents in the
 * `admins` collection.  Any admin document that has this openid in its
 * `authorized_openids` array grants access.
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
      const { data } = await db
         .collection('admins')
         .where({ authorized_openids: adminOpenId })
         .limit(1)
         .get();

      if (!data || data.length === 0) {
         throw new AuthorizationError('无管理员权限');
      }

      return adminOpenId;
   } catch (error) {
      if (error instanceof AuthorizationError) throw error;
      throw new AuthorizationError('管理员身份验证失败');
   }
}
