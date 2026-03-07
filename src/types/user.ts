/**
 * 用户相关类型定义
 */

export interface User {
   id: string;
   nickname: string;
   avatar: string;
   memberLevel: string;
   points: number;
   coupons: number;
}

export interface Reward {
   id: string;
   name: string;
   image: string;
   points: number;
   category: string;
}
