import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const VALID_ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export function isValidOrderStatus(status: string): status is OrderStatus {
   return VALID_ORDER_STATUSES.includes(status as OrderStatus);
}

export interface CloudContext {
   OPENID: string;
}

export function getOpenId(): string {
   const wxContext = cloud.getWXContext() as CloudContext;
   return wxContext.OPENID;
}

export { db, cloud };
