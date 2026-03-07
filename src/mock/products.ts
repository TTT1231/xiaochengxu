/**
 * 商品数据 - 根据 Figma 设计
 */

import type { Product } from '@/types';

export const products: Product[] = [
   // 招牌推荐
   {
      id: 'prod-1',
      name: '经典巧克力蛋糕',
      description: '进口丝滑巧克力，纯手工制作',
      price: 28,
      image: '/static/images/products/chocolate-cake.png',
      categoryId: 'cat-1',
   },
   {
      id: 'prod-2',
      name: '草莓芝士塔',
      description: '新鲜草莓配上浓郁奶酪芝士',
      price: 32,
      image: '/static/images/products/strawberry-tart.png',
      categoryId: 'cat-1',
   },
   {
      id: 'prod-3',
      name: '海盐焦糖拿铁',
      description: '现磨咖啡与海盐焦糖的完美结合',
      price: 25,
      image: '/static/images/products/salt-caramel-latte.png',
      categoryId: 'cat-1',
   },
   {
      id: 'prod-4',
      name: '枫糖可颂',
      description: '层层酥脆，枫糖香浓郁',
      price: 18,
      image: '/static/images/products/maple-croissant.png',
      categoryId: 'cat-1',
   },
   // 精选西点
   {
      id: 'prod-5',
      name: '提拉米苏',
      description: '马斯卡彭芝士、咖啡酒',
      price: 36,
      image: '/static/images/products/tiramisu.png',
      categoryId: 'cat-2',
   },
   {
      id: 'prod-6',
      name: '芒果班戟',
      description: '新鲜芒果、奶油、薄饼',
      price: 28,
      image: '/static/images/products/mango-pancake.png',
      categoryId: 'cat-2',
   },
   {
      id: 'prod-7',
      name: '抹茶千层蛋糕',
      description: '宇治抹茶、层层奶油',
      price: 42,
      image: '/static/images/products/matcha-cake.png',
      categoryId: 'cat-2',
   },
   // 特调饮品
   {
      id: 'prod-8',
      name: '杨枝甘露',
      description: '芒果、西柚、椰浆、西米',
      price: 22,
      image: '/static/images/products/mango-pomelo.png',
      categoryId: 'cat-3',
   },
   {
      id: 'prod-9',
      name: '珍珠奶茶',
      description: '经典红茶、珍珠、鲜奶',
      price: 16,
      image: '/static/images/products/pearl-milk-tea.png',
      categoryId: 'cat-3',
   },
   {
      id: 'prod-10',
      name: '多肉葡萄',
      description: '葡萄果肉、绿茶、芝士',
      price: 26,
      image: '/static/images/products/grape-tea.png',
      categoryId: 'cat-3',
   },
   // 休闲零食
   {
      id: 'prod-11',
      name: '手工曲奇礼盒',
      description: '6种口味、24片装',
      price: 58,
      image: '/static/images/products/cookies.png',
      categoryId: 'cat-4',
   },
   {
      id: 'prod-12',
      name: '马卡龙套装',
      description: '8色8味、精美礼盒',
      price: 68,
      image: '/static/images/products/macaron.png',
      categoryId: 'cat-4',
   },
   // 礼品套装
   {
      id: 'prod-13',
      name: '下午茶双人套餐',
      description: '2杯饮品+2份甜点',
      price: 88,
      image: '/static/images/products/afternoon-tea.png',
      categoryId: 'cat-5',
   },
   {
      id: 'prod-14',
      name: '生日蛋糕礼盒',
      description: '6寸蛋糕+蜡烛+餐具',
      price: 168,
      image: '/static/images/products/birthday-cake.png',
      categoryId: 'cat-5',
   },
];
