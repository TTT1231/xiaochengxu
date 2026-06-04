import { ref, computed } from 'vue';
import type { OrderStatus, Orders } from '@/types';
import { ORDER_STATUS_TEXT } from '@/types';
import { getOrdersByUser, getHistoryOrders } from '@/api/orderApi';
import { useUserStore } from '@/stores';

const STATUS_COLOR_MAP: Record<string, string> = {
   pending: '#f59e0b',
   preparing: '#3b82f6',
   ready: '#10b981',
   completed: '#6b7280',
   cancelled: '#ef4444',
};

const HISTORY_PAGE_SIZE = 3;

export function getStatusText(status: string): string {
   return ORDER_STATUS_TEXT[status as OrderStatus] ?? status;
}

export function getStatusClass(status: string): string {
   return `status-${status}`;
}

export function getStatusColor(status: string): string {
   return STATUS_COLOR_MAP[status] ?? '#6b7280';
}

export function useOrder() {
   const userStore = useUserStore();

   // 状态移入函数体内 — 每次调用 useOrder() 返回独立状态
   const orderList = ref<Orders[]>([]);
   const historyOrders = ref<Orders[]>([]);
   const hasMoreHistory = ref(true);
   const historyLoading = ref(false);
   const showActive = ref(true);
   const loading = ref(false);

   const fetchOrders = async (silent = false): Promise<void> => {
      if (!userStore.isAuthenticated) return;
      if (!silent) loading.value = true;
      try {
         orderList.value = await getOrdersByUser();
         historyOrders.value = [];
         hasMoreHistory.value = true;
         await loadMoreHistory();
      } catch {
         orderList.value = [];
      } finally {
         if (!silent) loading.value = false;
      }
   };

   const loadMoreHistory = async (): Promise<void> => {
      if (historyLoading.value || !hasMoreHistory.value) return;
      historyLoading.value = true;
      try {
         const { orders, hasMore } = await getHistoryOrders(
            HISTORY_PAGE_SIZE,
            historyOrders.value.length,
         );
         historyOrders.value = [...historyOrders.value, ...orders];
         hasMoreHistory.value = hasMore;
      } catch {
         // 静默失败，保留已加载的数据
      } finally {
         historyLoading.value = false;
      }
   };

   const activeOrders = computed(() =>
      orderList.value.filter(o => o.order_status !== 'completed' && o.order_status !== 'cancelled'),
   );

   const toggleOrderType = (isCurrent: boolean): void => {
      showActive.value = isCurrent;
   };

   return {
      displayOrders: orderList,
      isShowActive: showActive,
      loading,
      activeOrders,
      historyOrders,
      hasMoreHistory,
      historyLoading,
      getStatusText,
      getStatusClass,
      toggleOrderType,
      fetchOrders,
      loadMoreHistory,
   };
}
