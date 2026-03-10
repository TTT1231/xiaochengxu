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
export const rewardCategories = ['全部', '饮品类', '甜品类', '实物类', '会员类'];

/**
 * 根据分类筛选积分商品
 */
export const getRewardsByCategory = (category: string): Reward[] => {
   if (category === '全部') {
      return rewards;
   }
   return rewards.filter(reward => reward.category === category);
};

/**
 * 热门兑换商品（首页展示）
 */
export const hotRewards: Reward[] = [
   {
      id: 'hot-1',
      name: '5元代金券',
      image: '/static/images/rewards/coupon-placeholder.png',
      points: 500,
      category: '优惠券',
   },
   {
      id: 'hot-2',
      name: '经典葡式蛋挞',
      image: '/static/images/products/strawberry-tart.png',
      points: 800,
      category: '甜品类',
   },
   {
      id: 'hot-3',
      name: '品牌环保布袋',
      image: '/static/images/rewards/gift-placeholder.png',
      points: 1200,
      category: '实物类',
   },
   {
      id: 'hot-4',
      name: '醇香巧克力甜甜圈',
      image: '/static/images/products/cookies.png',
      points: 650,
      category: '甜品类',
   },
   {
      id: 'hot-5',
      name: '精选美式咖啡',
      image: '/static/images/products/salt-caramel-latte.png',
      points: 450,
      category: '饮品类',
   },
   {
      id: 'hot-6',
      name: '草莓奶油蛋糕',
      image: '/static/images/products/birthday-cake.png',
      points: 950,
      category: '甜品类',
   },
];
