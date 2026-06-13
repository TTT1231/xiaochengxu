import { CATEGORY_ID_BIRTHDAY_CAKE, BIRTHDAY_CAKE_ADVANCE_HOURS } from '@/types';

/** "HH:MM" 换算为当天分钟数；格式非法返回 NaN */
export function parseTimeToMinutes(time: string): number {
   const match = time.match(/^(\d{2}):(\d{2})$/);
   if (!match) return Number.NaN;
   const hours = Number(match[1]);
   const minutes = Number(match[2]);
   if (hours > 23 || minutes > 59) return Number.NaN;
   return hours * 60 + minutes;
}

/** 分钟数格式化为 "HH:MM"（越界自动夹紧到 00:00-23:59） */
export function formatMinutesToTime(min: number): string {
   const clamped = Math.max(0, Math.min(Math.trunc(min), 23 * 60 + 59));
   const h = String(Math.floor(clamped / 60)).padStart(2, '0');
   const m = String(clamped % 60).padStart(2, '0');
   return `${h}:${m}`;
}

/** 取某时刻的当天分钟数（默认当前时间） */
export function nowMinutes(date: Date = new Date()): number {
   return date.getHours() * 60 + date.getMinutes();
}

interface CakeDetectable {
   product: { categoried_id: string | number };
}

/** 单个商品是否为生日蛋糕（categoried_id === '3'） */
export function isCakeProduct(product: { categoried_id: string | number }): boolean {
   return String(product.categoried_id) === CATEGORY_ID_BIRTHDAY_CAKE;
}

/** 购物车是否含生日蛋糕（categoried_id === '3'） */
export function hasBirthdayCake(items: CakeDetectable[]): boolean {
   return items.some(item => isCakeProduct(item.product));
}

export type UnavailableReason = 'closed' | 'cake' | null;

interface ReasonParams {
   openTime: string;
   closeTime: string;
   hasCake: boolean;
   now?: Date;
}

/**
 * 今天是否还有合法的预约时间（驱动"隐藏选择器"决策）。
 * - 'closed'：已过营业结束，任何订单都无法预约今日
 * - 'cake'：营业中但含蛋糕且距关店不足提前量
 * - null：有合法时间，正常显示选择器
 *
 * 营业时间配置异常（解析失败）时返回 null，交由默认值兜底，不阻断流程。
 */
export function getUnavailableReason(params: ReasonParams): UnavailableReason {
   const { openTime, closeTime, hasCake, now = new Date() } = params;
   const close = parseTimeToMinutes(closeTime);
   if (Number.isNaN(close)) return null;
   const nowM = nowMinutes(now);
   if (nowM >= close) return 'closed';
   if (hasCake && nowM + BIRTHDAY_CAKE_ADVANCE_HOURS * 60 > close) return 'cake';
   return null;
}

/** 选择器可选下界（分钟）：取 max(营业开始, 现在+提前量)，蛋糕提前量为 3h，普通为 1 分钟 */
export function earliestPickupMinutes(params: ReasonParams): number {
   const { openTime, hasCake, now = new Date() } = params;
   const open = parseTimeToMinutes(openTime);
   const advance = hasCake ? BIRTHDAY_CAKE_ADVANCE_HOURS * 60 : 1;
   const base = nowMinutes(now) + advance;
   return Number.isNaN(open) ? base : Math.max(open, base);
}

export interface OrderTimeValidation {
   valid: boolean;
   message?: string;
}

interface ValidateParams extends ReasonParams {
   expectedTime: string;
}

/**
 * 校验所选预约时间（submit 兜底 + 服务端防篡改复算）。
 * 日常路径下选择器已约束，不会触发错误；此处覆盖页面停留过久、直连云函数等边界。
 */
export function validateOrderTime(params: ValidateParams): OrderTimeValidation {
   const { expectedTime, openTime, closeTime, hasCake, now = new Date() } = params;
   const exp = parseTimeToMinutes(expectedTime);
   if (Number.isNaN(exp)) {
      return { valid: false, message: '请选择有效的预约时间' };
   }
   const open = parseTimeToMinutes(openTime);
   const close = parseTimeToMinutes(closeTime);
   const nowM = nowMinutes(now);

   if (!Number.isNaN(open) && !Number.isNaN(close) && (exp < open || exp > close)) {
      return { valid: false, message: '请在营业时间内选择预约时间' };
   }
   const openFloor = Number.isNaN(open) ? 0 : open;
   const earliest = Math.max(openFloor, nowM + (hasCake ? BIRTHDAY_CAKE_ADVANCE_HOURS * 60 : 1));
   if (exp < earliest) {
      if (hasCake && exp < nowM + BIRTHDAY_CAKE_ADVANCE_HOURS * 60) {
         return { valid: false, message: '生日蛋糕需提前 3 小时预订' };
      }
      return { valid: false, message: '所选时间已过，请重新选择' };
   }
   return { valid: true };
}
