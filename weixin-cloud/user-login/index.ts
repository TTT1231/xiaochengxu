import { db, getOpenId } from '../utils/database';
import { generateUniqueDisplayId } from '../utils/id-generator';

interface LoginResult {
   success: boolean;
   data?: {
      user: Record<string, unknown>;
      wallet: Record<string, unknown>;
      isNewUser: boolean;
   };
   message: string;
}

export async function main(): Promise<LoginResult> {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed: no OPENID' };
   }

   // Parallel: fetch user + wallet in one round-trip
   const [userRes, walletRes] = await Promise.all([
      db
         .collection('users')
         .doc(openid)
         .get()
         .catch(() => null),
      db.collection('wallets').where({ user_id: openid }).limit(1).get(),
   ]);

   const user = userRes?.data;
   if (user) {
      const wallet = walletRes.data?.[0] || { user_id: openid, balance: 0, total_recharged: 0 };
      return {
         success: true,
         data: { user, wallet, isNewUser: false },
         message: 'Login successful',
      };
   }

   // New user: generate ID, then create user + wallet in transaction
   const displayId = await generateUniqueDisplayId();
   const now = new Date().toISOString();
   const defaultWallet = {
      user_id: openid,
      balance: 0,
      total_recharged: 0,
      created_at: now,
      updated_at: now,
   };

   try {
      await db.runTransaction(async transaction => {
         await transaction.collection('users').add({
            data: { _id: openid, name: '微信用户', id: displayId, created_at: now },
         });
         await transaction.collection('wallets').add({ data: defaultWallet });
      });

      return {
         success: true,
         data: {
            user: { _id: openid, name: '微信用户', id: displayId, created_at: now },
            wallet: defaultWallet,
            isNewUser: true,
         },
         message: 'Registration successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Registration failed: ' + msg };
   }
}
