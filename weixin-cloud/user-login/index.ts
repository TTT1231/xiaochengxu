import { db, getOpenId } from '../utils/database';
import { generateUniqueDisplayId } from '../utils/id-generator';

interface LoginResult {
   success: boolean;
   data?: {
      user: Record<string, unknown>;
      credits: Record<string, unknown>;
      isNewUser: boolean;
   };
   message: string;
}

export async function main(): Promise<LoginResult> {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed: no OPENID' };
   }

   // Check if user already exists
   const { data: user } = await db.collection('users').doc(openid).get();
   if (user) {
      const { data: creditsList } = await db.collection('credits').where({ users_id: openid }).get();
      const credits = creditsList[0] || { users_id: openid, total_scores: 0, available_scores: 0 };
      return {
         success: true,
         data: { user, credits, isNewUser: false },
         message: 'Login successful',
      };
   }

   // New user: create user + credits in a transaction
   const displayId = await generateUniqueDisplayId();
   const now = new Date().toISOString();

   try {
      await db.runTransaction(async (transaction) => {
         await transaction.collection('users').add({
            data: {
               _id: openid,
               name: '微信用户',
               id: displayId,
               level: '普通会员',
               created_at: now,
            },
         });
         await transaction.collection('credits').add({
            data: {
               users_id: openid,
               total_scores: 0,
               available_scores: 0,
            },
         });
      });

      const { data: newUser } = await db.collection('users').doc(openid).get();
      return {
         success: true,
         data: {
            user: newUser,
            credits: { users_id: openid, total_scores: 0, available_scores: 0 },
            isNewUser: true,
         },
         message: 'Registration successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Registration failed: ' + msg };
   }
}
