import { db, getOpenId } from '../utils/database';
import { refundWallet, findWalletByUserId } from '../utils/wallet';

interface CancelOrderParams {
   orderId: string;
}

export async function main(event: CancelOrderParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { orderId } = event;
   if (!orderId) {
      return { success: false, message: 'Order ID is required' };
   }

   try {
      const wallet = await findWalletByUserId(openid);
      const walletId = wallet?._id as string | undefined;

      return await db.runTransaction(async (transaction) => {
         let order: Record<string, unknown> | null = null;
         try {
            ({ data: order } = await transaction.collection('orders').doc(orderId).get());
         } catch {
            // Document doesn't exist
         }
         if (!order) {
            return { success: false, message: 'Order not found' };
         }

         if (order.user_id !== openid) {
            return { success: false, message: 'Order not found' };
         }

         if (order.order_status !== 'pending' && order.order_status !== 'preparing') {
            return { success: false, message: 'Order cannot be cancelled (status: ' + order.order_status + ')' };
         }

         await transaction
            .collection('orders')
            .doc(orderId)
            .update({ data: { order_status: 'cancelled' } });

         // Refund wallet balance if any was deducted
         const walletDeduct = (order.wallet_deduct as number) || 0;
         if (walletDeduct > 0) {
            if (!walletId) {
               throw new Error('Wallet not found');
            }

            const { data: currentWallet } = await transaction.collection('wallets').doc(walletId).get();
            if (!currentWallet || currentWallet.user_id !== openid) {
               throw new Error('Wallet not found');
            }

            const updated = refundWallet(
               {
                  balance: currentWallet.balance as number,
                  total_recharged: currentWallet.total_recharged as number,
               },
               walletDeduct,
            );
            await transaction
               .collection('wallets')
               .doc(walletId)
               .update({ data: { ...updated, updated_at: new Date().toISOString() } });
         }

         return { success: true, data: { order_id: orderId }, message: 'Order cancelled' };
      });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order cancellation failed: ' + msg };
   }
}
