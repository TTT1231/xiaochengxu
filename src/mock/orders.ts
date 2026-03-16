/**
 * 订单 Mock 数据
 */

import type { Orders } from '@/types';

export const orders: Orders[] = [
   {
      _id: 'order-1',
      order_id: '202401150001',
      user_id: 'mock-user-1',
      order_status: 'preparing',
      total_amount: 7800,
      discount_amount: 500,
      created_at: '2024-01-15 14:30',
      oder_details: [
         {
            product_id: 'p1',
            product_name: '经典巧克力蛋糕',
            product_image: '/static/images/store.png',
            specs: { 甜度: '标准甜' },
            price: 2800,
            quantity: 1,
         },
         {
            product_id: 'p2',
            product_name: '海盐焦糖拿铁',
            product_image: '/static/images/store.png',
            specs: { 甜度: '半糖' },
            price: 2500,
            quantity: 2,
         },
      ],
   },
   {
      _id: 'order-2',
      order_id: '202401150002',
      user_id: 'mock-user-1',
      order_status: 'ready',
      total_amount: 5800,
      discount_amount: 0,
      created_at: '2024-01-15 13:00',
      oder_details: [
         {
            product_id: 'p3',
            product_name: '提拉米苏',
            product_image: '/static/images/store.png',
            specs: {},
            price: 3600,
            quantity: 1,
         },
         {
            product_id: 'p4',
            product_name: '杨枝甘露',
            product_image: '/static/images/store.png',
            specs: {},
            price: 2200,
            quantity: 1,
         },
      ],
   },
   {
      _id: 'order-3',
      order_id: '202401140001',
      user_id: 'mock-user-1',
      order_status: 'completed',
      total_amount: 8000,
      discount_amount: 300,
      created_at: '2024-01-14 16:20',
      oder_details: [
         {
            product_id: 'p5',
            product_name: '草莓芝士塔',
            product_image: '/static/images/store.png',
            specs: {},
            price: 3200,
            quantity: 2,
         },
         {
            product_id: 'p6',
            product_name: '珍珠奶茶',
            product_image: '/static/images/store.png',
            specs: {},
            price: 1600,
            quantity: 1,
         },
      ],
   },
   {
      _id: 'order-4',
      order_id: '202401130001',
      user_id: 'mock-user-1',
      order_status: 'completed',
      total_amount: 8800,
      discount_amount: 0,
      created_at: '2024-01-13 15:00',
      oder_details: [
         {
            product_id: 'p7',
            product_name: '下午茶双人套餐',
            product_image: '/static/images/store.png',
            specs: {},
            price: 8800,
            quantity: 1,
         },
      ],
   },
];

/** 获取进行中的订单 */
export function getActiveOrders(): Orders[] {
   return orders.filter(order => order.order_status !== 'completed');
}

/** 获取历史订单（已完成） */
export function getHistoryOrders(): Orders[] {
   return orders.filter(order => order.order_status === 'completed');
}
