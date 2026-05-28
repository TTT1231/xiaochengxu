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

   // Parallel: fetch user + credits in one round-trip
   const [userRes, creditsRes] = await Promise.all([
      db.collection('users').doc(openid).get().catch(() => null),
      db.collection('credits').where({ users_id: openid }).limit(1).get(),
   ]);

   const user = userRes?.data;
   if (user) {
      const credits = creditsRes.data?.[0] || { users_id: openid, total_scores: 0, available_scores: 0 };
      return {
         success: true,
         data: { user, credits, isNewUser: false },
         message: 'Login successful',
      };
   }

   // New user: generate ID, then create user + credits in transaction
   const displayId = await generateUniqueDisplayId();
   const now = new Date().toISOString();
   const defaultCredits = { users_id: openid, total_scores: 0, available_scores: 0 };

   try {
      await db.runTransaction(async (transaction) => {
         await transaction.collection('users').add({
            data: { _id: openid, name: '微信用户', id: displayId, level: '普通会员', created_at: now },
         });
         await transaction.collection('credits').add({ data: defaultCredits });
      });

      return {
         success: true,
         data: {
            user: { _id: openid, name: '微信用户', id: displayId, level: '普通会员', created_at: now },
            credits: defaultCredits,
            isNewUser: true,
         },
         message: 'Registration successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Registration failed: ' + msg };
   }
}
