/**
 * 订单管理 composable
 */

import { ref, computed } from 'vue';
import type { Orders } from '@/types';
import { ORDER_STATUS_TEXT } from '@/types';
import { getOrdersByUser } from '@/api/orderApi';
import { useUserStore } from '@/stores';

// 当前查看的订单列表
const orderList = ref<Orders[]>([]);

// 是否显示当前订单
const showActive = ref(true);

// 加载状态
const loading = ref(false);

/**
 * 获取订单状态文本
 */
export const getStatusText = (status: string): string => {
   return (ORDER_STATUS_TEXT as Record<string, string>)[status] ?? status;
};

/**
 * 获取订单状态样式类名
 */
export const getStatusClass = (status: string): string => {
   return `status-${status}`;
};

export function useOrder() {
   const userStore = useUserStore();

   /**
    * 获取订单列表
    */
   const fetchOrders = async (): Promise<void> => {
      if (!userStore.openid) return;
      loading.value = true;
      try {
         orderList.value = await getOrdersByUser(userStore.openid);
      } catch (err) {
         console.error('获取订单失败:', err);
         orderList.value = [];
      } finally {
         loading.value = false;
      }
   };

   /**
    * 进行中的订单（非 completed、非 cancelled）
    */
   const activeOrders = computed(() =>
      orderList.value.filter(o => o.order_status !== 'completed' && o.order_status !== 'cancelled'),
   );

   /**
    * 历史订单（completed 或 cancelled）
    */
   const historyOrders = computed(() =>
      orderList.value.filter(o => o.order_status === 'completed' || o.order_status === 'cancelled'),
   );

   /**
    * 切换显示当前/历史订单
    */
   const toggleOrderType = (isCurrent: boolean): void => {
      showActive.value = isCurrent;
   };

   return {
      displayOrders: orderList,
      isShowActive: showActive,
      loading,
      activeOrders,
      historyOrders,
      getStatusText,
      getStatusClass,
      toggleOrderType,
      fetchOrders,
   };
}
