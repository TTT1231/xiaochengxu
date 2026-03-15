/**
 * 订单 Mock 数据
 */

import type { Order } from '@/types';

export const orders: Order[] = [
   {
      id: 'order-1',
      orderNo: '202401150001',
      storeName: '甜品工坊·中心城店',
      storeImage: '/static/images/store.png',
      status: 'preparing',
      items: [
         { productName: '经典巧克力蛋糕', quantity: 1, price: 2800 },
         { productName: '海盐焦糖拿铁', quantity: 2, price: 2500 },
      ],
      totalAmount: 7800,
      discountAmount: 500,
      createdAt: '2024-01-15 14:30',
      estimatedTime: '约15分钟',
   },
   {
      id: 'order-2',
      orderNo: '202401150002',
      storeName: '甜品工坊·万象城店',
      storeImage: '/static/images/store.png',
      status: 'ready',
      items: [
         { productName: '提拉米苏', quantity: 1, price: 3600 },
         { productName: '杨枝甘露', quantity: 1, price: 2200 },
      ],
      totalAmount: 5800,
      discountAmount: 0,
      createdAt: '2024-01-15 13:00',
      estimatedTime: '可取餐',
   },
   {
      id: 'order-3',
      orderNo: '202401140001',
      storeName: '甜品工坊·中心城店',
      storeImage: '/static/images/store.png',
      status: 'completed',
      items: [
         { productName: '草莓芝士塔', quantity: 2, price: 3200 },
         { productName: '珍珠奶茶', quantity: 1, price: 1600 },
      ],
      totalAmount: 8000,
      discountAmount: 300,
      createdAt: '2024-01-14 16:20',
   },
   {
      id: 'order-4',
      orderNo: '202401130001',
      storeName: '甜品工坊·万象城店',
      storeImage: '/static/images/store.png',
      status: 'completed',
      items: [{ productName: '下午茶双人套餐', quantity: 1, price: 8800 }],
      totalAmount: 8800,
      discountAmount: 0,
      createdAt: '2024-01-13 15:00',
   },
];

/** 获取进行中的订单 */
export function getActiveOrders(): Order[] {
   return orders.filter(order => order.status !== 'completed');
}

/** 获取历史订单（已完成） */
export function getHistoryOrders(): Order[] {
   return orders.filter(order => order.status === 'completed');
}
