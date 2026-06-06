import { db, cloud } from './database';

/**
 * Fail-closed administrator authorization.
 *
 * Reads the caller's OPENID from the WeChat cloud context and checks it
 * against the `authorized_openids` array stored in the `admins` config
 * document (`{ _id: 'admin_config', authorized_openids: string[] }`).
 *
 * Returns the verified openid on success.
 * Throws `AuthorizationError` on any failure — missing identity, missing
 * config, or openid not in the allowlist.
 */
export class AuthorizationError extends Error {
   constructor(reason: string) {
      super(reason);
      this.name = 'AuthorizationError';
   }
}

export async function authorizeAdmin(): Promise<string> {
   const wxContext = cloud.getWXContext() as { OPENID: string };
   const openid = wxContext.OPENID;

   if (!openid) {
      throw new AuthorizationError('无法获取调用者身份');
   }

   try {
      const { data } = await db.collection('admins').doc('admin_config').get();

      const config = data as { authorized_openids?: string[] } | null;
      const allowed: string[] = config?.authorized_openids ?? [];

      if (!allowed.includes(openid)) {
         throw new AuthorizationError('无管理员权限');
      }

      return openid;
   } catch (error) {
      // Re-throw our own authorization errors
      if (error instanceof AuthorizationError) throw error;

      // Any database / config error → fail closed
      throw new AuthorizationError('管理员身份验证失败');
   }
}
