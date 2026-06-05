import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

/** 有效的状态转换 */
const VALID_TRANSITIONS: Record<string, string[]> = {
   pending: ['preparing', 'cancelled'],
   preparing: ['ready'],
   ready: ['completed'],
};

const ADMIN_ORDER_USER_ID = 'admin';

interface UpdateOrderStatusParams {
   orderId: string;
   status: string;
   adminOpenId?: string;
}

/** 事务内校验失败时抛出，用于区分业务错误与系统错误 */
class TransitionValidationError extends Error {
   readonly currentStatus: string;
   readonly targetStatus: string;

   constructor(currentStatus: string, targetStatus: string) {
      super(`INVALID_TRANSITION:${currentStatus}:${targetStatus}`);
      this.name = 'TransitionValidationError';
      this.currentStatus = currentStatus;
      this.targetStatus = targetStatus;
   }
}

/** 更新订单状态（事务保护，消除竞态条件） */
export async function main(
   event: UpdateOrderStatusParams,
): Promise<{ success: boolean; message: string }> {
   const { orderId, adminOpenId } = event;
   const status = event.status === 'complete' ? 'completed' : event.status;

   if (!orderId || !status) {
      return { success: false, message: '参数不完整' };
   }

   try {
      // Step 1: 事务外用 where 查到文档 _id（_id 是稳定标识，不会变）
      const lookupRes = await db.collection('orders').where({ order_id: orderId }).limit(1).get();

      if (lookupRes.data.length === 0) {
         return { success: false, message: '订单不存在' };
      }

      const docId = (lookupRes.data[0] as { _id: string })._id;

      // Step 2: 事务内原子 读 → 校验 → 写
      await db.runTransaction(async transaction => {
         const docRes = await transaction.collection('orders').doc(docId).get();
         const order = docRes.data as { order_status: string; user_id?: string };
         const currentStatus = order.order_status;
         const isAdminOrder =
            order.user_id === ADMIN_ORDER_USER_ID ||
            (!!adminOpenId && order.user_id === adminOpenId);

         const allowed =
            isAdminOrder && ['pending', 'preparing', 'ready'].includes(currentStatus)
               ? ['completed', 'cancelled']
               : VALID_TRANSITIONS[currentStatus];
         if (!allowed || !allowed.includes(status)) {
            throw new TransitionValidationError(currentStatus, status);
         }

         await transaction
            .collection('orders')
            .doc(docId)
            .update({
               data: { order_status: status },
            });
      });

      return { success: true, message: '状态更新成功' };
   } catch (error) {
      if (error instanceof TransitionValidationError) {
         return {
            success: false,
            message: `不能从「${error.currentStatus}」变更为「${error.targetStatus}」`,
         };
      }
      console.error('update-order-status error:', error);
      return { success: false, message: '更新订单状态失败' };
   }
}
