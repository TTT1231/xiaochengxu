import { db, getOpenId } from '../utils/database';
import { subtractPoints, getUpdatedLevel } from '../utils/credits';

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

         // Verify ownership — return "not found" to avoid confirming existence
         if (order.user_id !== openid) {
            return { success: false, message: 'Order not found' };
         }

         // Validate status
         if (order.order_status !== 'pending' && order.order_status !== 'preparing') {
            return { success: false, message: 'Order cannot be cancelled (status: ' + order.order_status + ')' };
         }

         // Update order status
         await transaction
            .collection('orders')
            .doc(orderId)
            .update({ data: { order_status: 'cancelled' } });

         // Deduct credits
         const creditsEarned = (order.total_amount as number) - (order.discount_amount as number);
         const { data: creditsList } = await transaction
            .collection('credits')
            .where({ users_id: openid })
            .get();

         if (creditsList.length > 0) {
            const credits = creditsList[0];
            const updated = subtractPoints(
               { total_scores: credits.total_scores, available_scores: credits.available_scores },
               creditsEarned,
            );
            await transaction
               .collection('credits')
               .doc(credits._id as string)
               .update({ data: updated });

            // Check level downgrade
            const { data: user } = await transaction.collection('users').doc(openid).get();
            if (user) {
               const newLevel = getUpdatedLevel(user.level as string, updated.total_scores);
               if (newLevel) {
                  await transaction
                     .collection('users')
                     .doc(openid)
                     .update({ data: { level: newLevel } });
               }
            }
         }

         return { success: true, data: { order_id: orderId }, message: 'Order cancelled' };
      });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order cancellation failed: ' + msg };
   }
}
