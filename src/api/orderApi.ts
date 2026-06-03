import type { CartItem as CartItemType } from '@/stores/modules/cartStore';
import type { Orders, OrderDetailItem } from '@/types';
import { toProductImageFileID } from '@/utils/cloudStorage';

function parseDetails(order: Orders): OrderDetailItem[] {
   if (!order.oder_details) return [];
   if (Array.isArray(order.oder_details)) return order.oder_details;
   if (typeof order.oder_details === 'string') {
      try {
         return JSON.parse(order.oder_details);
      } catch {
         return [];
      }
   }
   return [];
}

function resolveOrderImages(order: Orders): Orders {
   const details = parseDetails(order);
   return {
      ...order,
      oder_details: details.map(item => ({
         ...item,
         product_image: toProductImageFileID(item.product_image),
      })),
   };
}

interface CreateOrderParams {
   items: CartItemType[];
   totalAmount: number;
   discountAmount?: number;
   walletDeduct?: number;
}

interface CreateOrderItem {
   product_id: string;
   specs: Record<string, string>;
   quantity: number;
}

export async function createOrder(params: CreateOrderParams): Promise<Orders> {
   const { items, totalAmount, discountAmount = 0, walletDeduct = 0 } = params;

   const orderItems: CreateOrderItem[] = items.map(item => ({
      product_id: item.product._id,
      specs: item.selectedSpecs,
      quantity: item.quantity,
   }));

   const res = await wx.cloud.callFunction({
      name: 'create-order',
      data: { items: orderItems, totalAmount, discountAmount, walletDeduct },
   });

   const result = res.result as { success: boolean; data?: { order_id: string }; message: string };
   if (!result.success) {
      throw new Error(result.message || '创建订单失败');
   }

   return { order_id: result.data!.order_id } as Orders;
}

export async function getOrdersByUser(): Promise<Orders[]> {
   const res = await wx.cloud.callFunction({
      name: 'get-orders',
      data: {},
   });

   const result = res.result as { success: boolean; data?: { orders: Orders[] }; message: string };
   if (!result.success) {
      console.error('[DEBUG getOrdersByUser] 云函数返回失败:', result.message);
      throw new Error(result.message || '获取订单列表失败');
   }
   const orders = (result.data?.orders || []).map(resolveOrderImages);
   return orders;
}

export async function getOrderDetail(orderId: string): Promise<Orders | null> {
   const res = await wx.cloud.callFunction({
      name: 'get-orders',
      data: { orderId },
   });

   const result = res.result as { success: boolean; data?: { order: Orders }; message: string };
   if (!result.success || !result.data) {
      return null;
   }
   return resolveOrderImages(result.data.order);
}

export async function getHistoryOrders(
   limit: number,
   skip: number,
): Promise<{ orders: Orders[]; hasMore: boolean }> {
   const res = await wx.cloud.callFunction({
      name: 'get-orders',
      data: { mode: 'history', historyLimit: limit, historySkip: skip },
   });

   const result = res.result as {
      success: boolean;
      data?: { orders: Orders[]; hasMore: boolean };
      message: string;
   };
   if (!result.success) {
      throw new Error(result.message || '获取历史订单失败');
   }
   const orders = (result.data?.orders ?? []).map(resolveOrderImages);
   return { orders, hasMore: result.data?.hasMore ?? false };
}

export async function cancelOrder(orderId: string): Promise<void> {
   const res = await wx.cloud.callFunction({
      name: 'cancel-order',
      data: { orderId },
   });

   const result = res.result as { success: boolean; message: string };
   if (!result.success) {
      throw new Error(result.message || '取消订单失败');
   }
}
