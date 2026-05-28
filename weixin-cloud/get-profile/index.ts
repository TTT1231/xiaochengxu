import { db, getOpenId } from '../utils/database';

export async function main() {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   try {
      const { data: user } = await db.collection('users').doc(openid).get();
      if (!user) {
         return { success: false, message: 'User not found' };
      }

      const { data: creditsList } = await db.collection('credits').where({ users_id: openid }).get();
      const credits = creditsList[0] || null;

      return {
         success: true,
         data: { user, credits },
         message: 'Success',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Failed to get profile: ' + msg };
   }
}
