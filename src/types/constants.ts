/** 订单状态 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

/** 订单状态文本映射 */
export const ORDER_STATUS_TEXT: Record<string, string> = {
   pending: '待处理',
   preparing: '正在制作中...',
   ready: '待取餐',
   completed: '已完成',
   cancelled: '已取消',
};
