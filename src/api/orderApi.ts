import type { CartItem as CartItemType } from '@/stores/modules/cartStore';
import type { Orders, OrderDetailItem } from '@/types';

interface CreateOrderParams {
   items: CartItemType[];
   totalAmount: number;
   discountAmount?: number;
}

export async function createOrder(params: CreateOrderParams): Promise<Orders> {
   const { items, totalAmount, discountAmount = 0 } = params;

   const oder_details: OrderDetailItem[] = items.map(item => ({
      product_id: item.product._id,
      product_name: item.product.name,
      product_image: item.product.images.split('&')[0] || '',
      specs: item.selectedSpecs,
      price: item.product.price,
      discount: item.product.discount,
      quantity: item.quantity,
   }));

   const res = await wx.cloud.callFunction({
      name: 'create-order',
      data: { items: oder_details, totalAmount, discountAmount },
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
      throw new Error(result.message || '获取订单列表失败');
   }
   return result.data?.orders || [];
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
   return result.data.order;
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
