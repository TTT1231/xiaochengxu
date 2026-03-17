/**
 * 订单管理 composable
 */

import { ref, computed } from 'vue';
import type { Orders } from '@/types';
import { ORDER_STATUS_TEXT } from '@/types';
import { getOrdersByUser } from '@/api/orderApi';
import { useUserStore } from '@/stores';

/** 订单状态颜色映射（与 uni.scss 中 $status-* 变量保持一致） */
const STATUS_COLOR_MAP: Record<string, string> = {
   pending: '#f59e0b',
   preparing: '#3b82f6',
   ready: '#10b981',
   completed: '#6b7280',
   cancelled: '#ef4444',
};

// 当前查看的订单列表
const orderList = ref<Orders[]>([]);

// 是否显示当前订单
const showActive = ref(true);

// 加载状态
const loading = ref(false);

/**
 * 获取订单状态文本
 */
export function getStatusText(status: string): string {
   return ORDER_STATUS_TEXT[status] ?? status;
}

/**
 * 获取订单状态样式类名
 */
export function getStatusClass(status: string): string {
   return `status-${status}`;
}

/**
 * 获取订单状态颜色
 * 颜色值与 uni.scss 中 $status-* 变量保持一致
 */
export function getStatusColor(status: string): string {
   return STATUS_COLOR_MAP[status] ?? '#6b7280';
}

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
      } catch {
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
