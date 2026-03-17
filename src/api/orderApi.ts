/**
 * 订单 API
 */
import { supabaseClient } from '@/utils/supabaseClient';
import type { CartItem as CartItemType } from '@/stores/modules/cartStore';
import type { Orders, OrderDetailItem } from '@/types';

interface CreateOrderParams {
   userId: string;
   items: CartItemType[];
   totalAmount: number;
   discountAmount?: number;
}

/**
 * 从 error 对象中提取可读的错误信息
 * 兼容 PostgrestError ({ message }) 和微信小程序环境下的 wx.request 响应 ({ data: { message } })
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractErrorMessage(error: any): string {
   if (!error) return '未知错误';
   if (typeof error === 'string') return error;
   // 标准 PostgrestError
   if (error.message) return error.message;
   // 微信小程序 wx.request 风格响应
   if (error.data?.message) return error.data.message;
   // 兜底
   return JSON.stringify(error);
}

/**
 * 创建订单
 */
export async function createOrder(params: CreateOrderParams): Promise<Orders> {
   const { userId, items, totalAmount, discountAmount = 0 } = params;

   const oder_details: OrderDetailItem[] = items.map(item => ({
      product_id: item.product._id,
      product_name: item.product.name,
      product_image: item.product.images.split('&')[0] || '',
      specs: item.selectedSpecs,
      price: item.product.price,
      discount: item.product.discount,
      quantity: item.quantity,
   }));

   const order_id = `DD${Date.now()}`;

   const client = supabaseClient.getClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const db = client as any;
   const { data, error } = await db
      .from('orders')
      .insert({
         order_id,
         user_id: userId,
         order_status: 'pending',
         total_amount: totalAmount,
         discount_amount: discountAmount,
         oder_details,
      })
      .select()
      .single();

   if (error) {
      throw new Error(`创建订单失败: ${extractErrorMessage(error)}`);
   }

   return data as unknown as Orders;
}

/**
 * 获取用户订单列表
 */
export async function getOrdersByUser(openid: string): Promise<Orders[]> {
   const client = supabaseClient.getClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const db = client as any;
   const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('user_id', openid)
      .order('created_at', { ascending: false });

   if (error) {
      throw new Error(`获取订单列表失败: ${extractErrorMessage(error)}`);
   }

   return (data ?? []) as unknown as Orders[];
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(orderId: string): Promise<Orders | null> {
   const client = supabaseClient.getClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const db = client as any;
   const { data, error } = await db.from('orders').select('*').eq('order_id', orderId).single();

   if (error) {
      // PGRST116 = 查询无结果
      if (error.code === 'PGRST116') return null;
      throw new Error(`获取订单详情失败: ${extractErrorMessage(error)}`);
   }

   return data as unknown as Orders;
}

/**
 * 取消订单
 */
export async function cancelOrder(orderId: string): Promise<void> {
   const client = supabaseClient.getClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const db = client as any;
   const { error } = await db
      .from('orders')
      .update({ order_status: 'cancelled' })
      .eq('order_id', orderId);

   if (error) {
      throw new Error(`取消订单失败: ${extractErrorMessage(error)}`);
   }
}
