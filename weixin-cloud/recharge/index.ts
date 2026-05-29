import { db, getOpenId } from '../utils/database';
import { rechargeWallet, findWalletByUserId } from '../utils/wallet';

interface RechargeParams {
   amount: number;
}

export async function main(event: RechargeParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { amount } = event;
   if (!amount || typeof amount !== 'number' || amount <= 0) {
      return { success: false, message: 'Invalid amount' };
   }

   try {
      let wallet = await findWalletByUserId(openid);

      if (!wallet) {
         const now = new Date().toISOString();
         const { _id } = await db.collection('wallets').add({
            data: { user_id: openid, balance: 0, total_recharged: 0, created_at: now, updated_at: now },
         });
         wallet = { _id, user_id: openid, balance: 0, total_recharged: 0, created_at: now, updated_at: now };
      }

      const updated = rechargeWallet(
         { balance: wallet.balance as number, total_recharged: wallet.total_recharged as number },
         amount,
      );
      const now = new Date().toISOString();
      await db
         .collection('wallets')
         .doc(wallet._id as string)
         .update({ data: { ...updated, updated_at: now } });

      return {
         success: true,
         data: { wallet: { ...wallet, ...updated, updated_at: now } },
         message: 'Recharge successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Recharge failed: ' + msg };
   }
}
