/**
 * 用户 Mock 数据
 */

import type { User, Reward } from '@/types';

export const currentUser: User = {
   id: 'user-1',
   nickname: '甜品爱好者',
   avatar: '/static/images/avatar.png',
   memberLevel: '黄金会员',
   points: 2580,
   coupons: 3,
};

export const hotRewards: Reward[] = [
   {
      id: 'reward-1',
      name: '免费饮品券',
      image: '/static/images/rewards/drink.png',
      points: 500,
      category: '饮品',
   },
   {
      id: 'reward-2',
      name: '甜品抵扣券 ¥20',
      image: '/static/images/rewards/coupon.png',
      points: 800,
      category: '优惠券',
   },
   {
      id: 'reward-3',
      name: '生日蛋糕专属折扣',
      image: '/static/images/rewards/cake.png',
      points: 1500,
      category: '特权',
   },
];
