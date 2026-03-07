/**
 * 积分商品数据
 */

import type { Reward } from '@/types';

export const rewards: Reward[] = [
   // 饮品类 - 使用优惠券占位图
   {
      id: 'reward-1',
      name: '免费奶茶券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 500,
      category: '饮品类',
   },
   {
      id: 'reward-2',
      name: '果茶5折券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 300,
      category: '饮品类',
   },
   {
      id: 'reward-3',
      name: '咖啡买一送一券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 400,
      category: '饮品类',
   },
   // 甜品类 - 使用优惠券占位图
   {
      id: 'reward-4',
      name: '甜品8折券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 350,
      category: '甜品类',
   },
   {
      id: 'reward-5',
      name: '冰淇淋免费券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 200,
      category: '甜品类',
   },
   // 实物类 - 使用礼品占位图
   {
      id: 'reward-6',
      name: '品牌马克杯',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 1500,
      category: '实物类',
   },
   {
      id: 'reward-7',
      name: '帆布购物袋',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 800,
      category: '实物类',
   },
   {
      id: 'reward-8',
      name: '限定钥匙扣',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 600,
      category: '实物类',
   },
   // 会员类 - 使用礼品占位图
   {
      id: 'reward-9',
      name: '会员积分双倍卡',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 1000,
      category: '会员类',
   },
   {
      id: 'reward-10',
      name: '专属生日礼包',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 2000,
      category: '会员类',
   },
];

/**
 * 获取积分商品分类
 */
export const rewardCategories = [
   '全部',
   '饮品类',
   '甜品类',
   '实物类',
   '会员类',
];

/**
 * 根据分类筛选积分商品
 */
export const getRewardsByCategory = (category: string): Reward[] => {
   if (category === '全部') {
      return rewards;
   }
   return rewards.filter(reward => reward.category === category);
};
