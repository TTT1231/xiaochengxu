export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
   pending: '待处理',
   preparing: '正在制作中...',
   ready: '待取餐',
   completed: '已完成',
   cancelled: '已取消',
};

export type DeliveryType = 'pickup' | 'delivery';

export const DELIVERY_TYPE_TEXT: Record<DeliveryType, string> = {
   pickup: '到店自提',
   delivery: '商家配送',
};
