import { ref, computed } from 'vue';
import type { OrderStatus, Orders } from '@/types';
import { ORDER_STATUS_TEXT } from '@/types';
import { getOrdersByUser } from '@/api/orderApi';
import { useUserStore } from '@/stores';

const STATUS_COLOR_MAP: Record<string, string> = {
   pending: '#f59e0b',
   preparing: '#3b82f6',
   ready: '#10b981',
   completed: '#6b7280',
   cancelled: '#ef4444',
};

const orderList = ref<Orders[]>([]);
const showActive = ref(true);
const loading = ref(false);

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

   const fetchOrders = async (silent = false): Promise<void> => {
      if (!userStore.openid) return;
      if (!silent) loading.value = true;
      try {
         orderList.value = await getOrdersByUser(userStore.openid);
      } catch {
         orderList.value = [];
      } finally {
         if (!silent) loading.value = false;
      }
   };

   const activeOrders = computed(() =>
      orderList.value.filter(o => o.order_status !== 'completed' && o.order_status !== 'cancelled'),
   );

   const historyOrders = computed(() =>
      orderList.value.filter(o => o.order_status === 'completed' || o.order_status === 'cancelled'),
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
      getStatusText,
      getStatusClass,
      toggleOrderType,
      fetchOrders,
   };
}
