import type { CartItem as CartItemType } from '@/stores/modules/cartStore';
import type { Orders, OrderDetailItem } from '@/types';
import { toProductImageFileID } from '@/utils/cloudStorage';

/**
 * 将数据库原始字段映射到规范化的 Orders 类型。
 * 数据库历史字段 `oder_details` → TypeScript `order_details`
 */
function normalizeOrder(raw: Record<string, unknown>): Orders {
   const details = (raw.oder_details ?? raw.order_details ?? []) as OrderDetailItem[];
   return {
      _id: raw._id as string,
      order_id: raw.order_id as string,
      user_id: raw.user_id as string,
      order_status: raw.order_status as Orders['order_status'],
      total_amount: raw.total_amount as number,
      discount_amount: (raw.discount_amount ?? 0) as number,
      created_at: raw.created_at as string,
      wallet_deduct: (raw.wallet_deduct ?? 0) as number,
      order_details: details,
   };
}

function resolveOrderImages(raw: Record<string, unknown>): Orders {
   const order = normalizeOrder(raw);
   return {
      ...order,
      order_details: order.order_details.map(item => ({
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

   try {
      const res = await wx.cloud.callFunction({
         name: 'create-order',
         data: { items: orderItems, totalAmount, discountAmount, walletDeduct },
      });

      const result = res.result as {
         success: boolean;
         data?: { order_id: string };
         message: string;
      };
      if (!result.success) {
         throw new Error(result.message || '创建订单失败');
      }
      if (!result.data?.order_id) {
         throw new Error('创建订单返回数据异常');
      }

      return normalizeOrder({ order_id: result.data.order_id });
   } catch (error) {
      throw new Error(error instanceof Error ? error.message : '创建订单失败');
   }
}

export async function getOrdersByUser(): Promise<Orders[]> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'get-orders',
         data: {},
      });

      const result = res.result as {
         success: boolean;
         data?: { orders: Record<string, unknown>[] };
         message: string;
      };
      if (!result.success) {
         throw new Error(result.message || '获取订单列表失败');
      }
      return (result.data?.orders ?? []).map(resolveOrderImages);
   } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取订单列表失败');
   }
}

export async function getOrderDetail(orderId: string): Promise<Orders | null> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'get-orders',
         data: { orderId },
      });

      const result = res.result as {
         success: boolean;
         data?: { order: Record<string, unknown> };
         message: string;
      };
      if (!result.success || !result.data?.order) {
         return null;
      }
      return resolveOrderImages(result.data.order);
   } catch {
      return null;
   }
}

export async function getHistoryOrders(
   limit: number,
   skip: number,
): Promise<{ orders: Orders[]; hasMore: boolean }> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'get-orders',
         data: { mode: 'history', historyLimit: limit, historySkip: skip },
      });

      const result = res.result as {
         success: boolean;
         data?: { orders: Record<string, unknown>[]; hasMore: boolean };
         message: string;
      };
      if (!result.success) {
         throw new Error(result.message || '获取历史订单失败');
      }
      const orders = (result.data?.orders ?? []).map(resolveOrderImages);
      return { orders, hasMore: result.data?.hasMore ?? false };
   } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取历史订单失败');
   }
}

export async function cancelOrder(orderId: string): Promise<void> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'cancel-order',
         data: { orderId },
      });

      const result = res.result as { success: boolean; message: string };
      if (!result.success) {
         throw new Error(result.message || '取消订单失败');
      }
   } catch (error) {
      throw new Error(error instanceof Error ? error.message : '取消订单失败');
   }
}
