import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const VALID_ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

const VALID_USER_LEVELS = ['普通会员', '黄铜会员', '白银会员', '黄金会员'] as const;
export type UserLevel = (typeof VALID_USER_LEVELS)[number];

const LEVEL_THRESHOLDS: { min: number; level: UserLevel }[] = [
   { min: 300, level: '黄金会员' },
   { min: 200, level: '白银会员' },
   { min: 100, level: '黄铜会员' },
];

export function isValidOrderStatus(status: string): status is OrderStatus {
   return VALID_ORDER_STATUSES.includes(status as OrderStatus);
}

export function isValidUserLevel(level: string): level is UserLevel {
   return VALID_USER_LEVELS.includes(level as UserLevel);
}

export function getLevelForScore(totalScores: number): UserLevel {
   for (const { min, level } of LEVEL_THRESHOLDS) {
      if (totalScores >= min) return level;
   }
   return '普通会员';
}

export interface CloudContext {
   OPENID: string;
}

export function getOpenId(): string {
   const wxContext = cloud.getWXContext() as CloudContext;
   return wxContext.OPENID;
}

export { db, cloud };
