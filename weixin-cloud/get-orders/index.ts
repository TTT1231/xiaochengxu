import { db, getOpenId } from '../utils/database';

interface GetOrdersParams {
   orderId?: string;
   mode?: 'all' | 'history';
   historyLimit?: number;
   historySkip?: number;
}

export async function main(event: GetOrdersParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { orderId, mode, historyLimit = 3, historySkip = 0 } = event;

   try {
      // Get single order detail
      if (orderId) {
         let order: Record<string, unknown> | null = null;
         try {
            ({ data: order } = await db.collection('orders').doc(orderId).get());
         } catch {
            // Document doesn't exist
         }
         if (!order) {
            return { success: false, message: 'Order not found' };
         }
         // Ownership verification — return "not found" to avoid confirming existence
         if (order.user_id !== openid) {
            return { success: false, message: 'Order not found' };
         }
         return { success: true, data: { order }, message: 'Success' };
      }

      // Paginated history orders (completed / cancelled only)
      if (mode === 'history') {
         const cmd = db.command;
         const fetchLimit = historyLimit + 1;

         const { data: orders } = await db
            .collection('orders')
            .where({
               user_id: openid,
               order_status: cmd.in(['completed', 'cancelled']),
            })
            .orderBy('created_at', 'desc')
            .skip(historySkip)
            .limit(fetchLimit)
            .get();

         const hasMore = orders.length > historyLimit;
         const result = hasMore ? orders.slice(0, historyLimit) : orders;

         return { success: true, data: { orders: result, hasMore }, message: 'Success' };
      }

      // Default: get all orders for user (max 100 per query)
      const { data: orders } = await db
         .collection('orders')
         .where({ user_id: openid })
         .orderBy('created_at', 'desc')
         .limit(100)
         .get();

      return { success: true, data: { orders }, message: 'Success' };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Failed to get orders: ' + msg };
   }
}
