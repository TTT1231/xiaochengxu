import { db, getOpenId } from '../utils/database';
import { rechargeWallet, ensureWallet } from '../utils/wallet';

interface RedeemVipCardParams {
   card_no: string;
}

export async function main(event: RedeemVipCardParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const trimmedCardNo = (event.card_no ?? '').trim();
   if (!trimmedCardNo) {
      return { success: false, message: '请输入卡号' };
   }

   try {
      // 1. Look up the card
      const { data: cards } = await db
         .collection('vip_cards')
         .where({ card_no: trimmedCardNo })
         .limit(1)
         .get();

      if (cards.length === 0) {
         return { success: false, message: '卡号不存在' };
      }

      const card = cards[0];

      if (card.status === 'used') {
         return { success: false, message: '该卡号已被使用' };
      }

      const cardAmount = card.amount as number;
      if (!cardAmount || cardAmount <= 0) {
         return { success: false, message: '无效的卡面值' };
      }

      // 2. Ensure wallet exists
      const wallet = await ensureWallet(openid);

      // 3. Use runTransaction for atomic card + wallet update
      const now = new Date().toISOString();
      const result = await db.runTransaction(async (transaction) => {
         // Mark card as used
         await transaction
            .collection('vip_cards')
            .doc(card._id as string)
            .update({
               data: {
                  status: 'used',
                  used_by: openid,
                  used_at: now,
               },
            });

         // Credit wallet
         const updated = rechargeWallet(
            {
               balance: wallet.balance as number,
               total_recharged: wallet.total_recharged as number,
            },
            cardAmount,
         );
         await transaction
            .collection('wallets')
            .doc(wallet._id as string)
            .update({ data: { ...updated, updated_at: now } });

         return { ...wallet, ...updated, updated_at: now };
      });

      return {
         success: true,
         data: { amount: cardAmount, wallet: result },
         message: '兑换成功',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: '兑换失败: ' + msg };
   }
}
