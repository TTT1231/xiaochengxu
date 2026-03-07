/**
 * 订单数据
 */

import type { Order } from '@/types';

export const orders: Order[] = [
   // 进行中订单
   {
      id: 'order-1',
      orderNo: 'DD20260306001',
      storeName: '甜品屋 · 万达店',
      storeImage: '/static/images/store.png',
      status: 'preparing',
      items: [
         { productName: '杨枝甘露', quantity: 2, price: 18 },
         { productName: '珍珠奶茶', quantity: 1, price: 15 },
      ],
      totalAmount: 51,
      discountAmount: 5,
      createdAt: '2026-03-06 14:30:00',
      estimatedTime: '约15分钟',
   },
   {
      id: 'order-2',
      orderNo: 'DD20260306002',
      storeName: '甜品屋 · 万达店',
      storeImage: '/static/images/store.png',
      status: 'ready',
      items: [
         { productName: '提拉米苏', quantity: 1, price: 28 },
         { productName: '拿铁咖啡', quantity: 2, price: 18 },
      ],
      totalAmount: 64,
      discountAmount: 0,
      createdAt: '2026-03-06 13:00:00',
      estimatedTime: '可取餐',
   },
   // 历史订单
   {
      id: 'order-3',
      orderNo: 'DD20260305001',
      storeName: '甜品屋 · 万达店',
      storeImage: '/static/images/store.png',
      status: 'completed',
      items: [
         { productName: '多肉葡萄', quantity: 2, price: 22 },
         { productName: '满杯橙橙', quantity: 1, price: 18 },
      ],
      totalAmount: 62,
      discountAmount: 10,
      createdAt: '2025-03-05 15:20:00',
   },
   {
      id: 'order-4',
      orderNo: 'DD20260304001',
      storeName: '甜品屋 · 万达店',
      storeImage: '/static/images/store.png',
      status: 'completed',
      items: [{ productName: '芋泥奶茶', quantity: 3, price: 19 }],
      totalAmount: 57,
      discountAmount: 0,
      createdAt: '2025-03-04 10:15:00',
   },
   {
      id: 'order-5',
      orderNo: 'DD20260303001',
      storeName: '甜品屋 · 万达店',
      storeImage: '/static/images/store.png',
      status: 'completed',
      items: [
         { productName: '美式咖啡', quantity: 2, price: 15 },
         { productName: '香草冰淇淋', quantity: 1, price: 12 },
      ],
      totalAmount: 42,
      discountAmount: 5,
      createdAt: '2025-03-03 09:00:00',
   },
];

/**
 * 获取进行中的订单
 */
export const getActiveOrders = (): Order[] => {
   return orders.filter(order => order.status !== 'completed');
};

/**
 * 获取历史订单
 */
export const getHistoryOrders = (): Order[] => {
   return orders.filter(order => order.status === 'completed');
};
