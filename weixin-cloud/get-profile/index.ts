import { db, getOpenId } from '../utils/database';

export async function main() {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   try {
      let user: Record<string, unknown> | null = null;
      try {
         ({ data: user } = await db.collection('users').doc(openid).get());
      } catch {
         // Document doesn't exist
      }
      if (!user) {
         return { success: false, message: 'User not found' };
      }

      const { data: wallets } = await db.collection('wallets').where({ user_id: openid }).limit(1).get();
      const wallet = wallets[0] || null;

      return {
         success: true,
         data: { user, wallet },
         message: 'Success',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Failed to get profile: ' + msg };
   }
}
