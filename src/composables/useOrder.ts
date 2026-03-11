/**
 * 订单管理 composable
 */

import { ref } from 'vue';
import type { Order, OrderStatus } from '@/types';
import { getActiveOrders, getHistoryOrders } from '@/mock';

// 当前查看的订单列表
const orderList = ref<Order[]>([]);

// 是否显示当前订单
const showActive = ref(true);

/**
 * 订单状态文本映射
 */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
   pending: '待处理',
   preparing: '正在制作中...',
   ready: '待取餐',
   completed: '已完成',
};

/**
 * 获取订单状态文本
 */
export const getStatusText = (status: OrderStatus): string => {
   return ORDER_STATUS_TEXT[status];
};

/**
 * 获取订单状态样式类名
 */
export const getStatusClass = (status: OrderStatus): string => {
   return `status-${status}`;
};

export function useOrder() {
   /**
    * 切换显示当前/历史订单
    */
   const toggleOrderType = (isCurrent: boolean): void => {
      showActive.value = isCurrent;
      orderList.value = isCurrent ? getActiveOrders() : getHistoryOrders();
   };

   /**
    * 初始化订单列表
    */
   const initOrders = (): void => {
      orderList.value = getActiveOrders();
   };

   return {
      // 直接返回 ref，避免冗余 computed
      displayOrders: orderList,
      isShowActive: showActive,
      getStatusText,
      getStatusClass,
      toggleOrderType,
      initOrders,
   };
}
