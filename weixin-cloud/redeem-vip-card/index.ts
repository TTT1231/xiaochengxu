import { db, getOpenId } from '../utils/database';
import { rechargeWallet, ensureWallet } from '../utils/wallet';

interface RedeemVipCardParams {
   card_no: string;
}

interface Transaction {
   collection(name: string): {
      doc(id: string): {
         get(): Promise<{ data: Record<string, unknown> }>;
         update(data: { data: Record<string, unknown> }): Promise<unknown>;
      };
   };
}

const MAX_CARD_NO_LENGTH = 64;

const KNOWN_ERRORS = new Set([
   '该卡号已被使用',
   '该卡号无效',
   '无效的卡面值',
   'Wallet not found',
]);

export async function main(event: RedeemVipCardParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const trimmedCardNo = (event.card_no ?? '').trim();
   if (!trimmedCardNo) {
      return { success: false, message: '请输入卡号' };
   }

   if (trimmedCardNo.length > MAX_CARD_NO_LENGTH) {
      return { success: false, message: '卡号格式不正确' };
   }

   try {
      // 1. Resolve card_no to card ID (read-only lookup outside transaction)
      const { data: cards } = await db
         .collection('vip_cards')
         .where({ card_no: trimmedCardNo })
         .limit(1)
         .get();

      if (cards.length === 0) {
         return { success: false, message: '卡号不存在' };
      }

      const cardId = cards[0]._id as string;

      // 2. Ensure wallet exists (get wallet ID)
      const wallet = await ensureWallet(openid);
      const walletId = wallet._id as string;

      // 3. Atomic card + wallet update inside transaction
      const now = new Date().toISOString();
      const result = await db.runTransaction(async (transaction: Transaction) => {
         // Re-read card inside transaction for fresh status
         const { data: card } = await transaction.collection('vip_cards').doc(cardId).get();
         if (!card || card.status !== 'active') {
            throw new Error(card?.status === 'used' ? '该卡号已被使用' : '该卡号无效');
         }

         const cardAmount = Number(card.amount);
         if (!Number.isFinite(cardAmount) || cardAmount <= 0) {
            throw new Error('无效的卡面值');
         }

         // Re-read wallet inside transaction for fresh balance
         const { data: currentWallet } = await transaction
            .collection('wallets')
            .doc(walletId)
            .get();
         if (!currentWallet || currentWallet.user_id !== openid) {
            throw new Error('Wallet not found');
         }

         // Mark card as used
         await transaction.collection('vip_cards').doc(cardId).update({
            data: {
               status: 'used',
               used_by: openid,
               used_at: now,
            },
         });

         // Credit wallet with fresh balance
         const updated = rechargeWallet(
            {
               balance: currentWallet.balance as number,
               total_recharged: currentWallet.total_recharged as number,
            },
            cardAmount,
         );
         await transaction
            .collection('wallets')
            .doc(walletId)
            .update({ data: { ...updated, updated_at: now } });

         return {
            amount: cardAmount,
            wallet: { ...currentWallet, ...updated, updated_at: now },
         };
      });

      return {
         success: true,
         data: result,
         message: '兑换成功',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (KNOWN_ERRORS.has(msg)) {
         return { success: false, message: msg };
      }
      return { success: false, message: '兑换失败，请稍后重试' };
   }
}
