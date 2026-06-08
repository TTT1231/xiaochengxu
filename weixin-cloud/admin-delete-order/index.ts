import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

/** 仅允许删除已完成或已取消的订单，防止误删进行中的订单 */
const DELETABLE_STATUSES = ['completed', 'cancelled'];

interface DeleteOrderParams {
   orderId: string;
}

interface OrderDoc {
   _id: string;
   order_id: string;
   order_status: string;
}

/** 管理员删除订单（仅限已完成 / 已取消） */
export async function main(
   event: DeleteOrderParams,
): Promise<{ success: boolean; data?: { orderId: string }; message: string }> {
   const { orderId } = event;

   if (!orderId) {
      return { success: false, message: '缺少订单号' };
   }

   try {
      const lookupRes = await db.collection('orders').where({ order_id: orderId }).limit(1).get();

      if (lookupRes.data.length === 0) {
         return { success: false, message: '订单不存在' };
      }

      const order = lookupRes.data[0] as unknown as OrderDoc;

      if (!DELETABLE_STATUSES.includes(order.order_status)) {
         return {
            success: false,
            message: `仅可删除已完成或已取消的订单，当前状态：${order.order_status}`,
         };
      }

      await db.collection('orders').doc(order._id).remove();

      return {
         success: true,
         data: { orderId },
         message: '删除订单成功',
      };
   } catch (error) {
      console.error('admin-delete-order error:', error);
      return { success: false, message: '删除订单失败' };
   }
}
