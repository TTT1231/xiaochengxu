/**
 * 订单相关类型定义
 */

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface OrderItem {
   productName: string;
   quantity: number;
   price: number;
}

export interface Order {
   id: string;
   orderNo: string;
   storeName: string;
   storeImage: string;
   status: OrderStatus;
   items: OrderItem[];
   totalAmount: number;
   discountAmount: number;
   createdAt: string;
   estimatedTime?: string;
}
