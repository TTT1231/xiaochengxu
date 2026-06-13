import { describe, it, expect } from 'vitest';
import {
   parseTimeToMinutes,
   formatMinutesToTime,
   hasBirthdayCake,
   isCakeProduct,
   getUnavailableReason,
   earliestPickupMinutes,
   validateOrderTime,
} from '../../src/utils/orderTime';

const OPEN = '09:00';
const CLOSE = '22:00';
/** 构造一个固定"当前时刻"的 Date，便于注入测试 */
const at = (h: number, m: number) => new Date(2024, 0, 1, h, m);

describe('parseTimeToMinutes', () => {
   it('parses valid HH:MM', () => {
      expect(parseTimeToMinutes('09:00')).toBe(540);
      expect(parseTimeToMinutes('22:00')).toBe(1320);
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
      expect(parseTimeToMinutes('18:30')).toBe(1110);
   });

   it('returns NaN for invalid formats', () => {
      expect(Number.isNaN(parseTimeToMinutes('9:00'))).toBe(true);
      expect(Number.isNaN(parseTimeToMinutes('24:00'))).toBe(true);
      expect(Number.isNaN(parseTimeToMinutes('12:60'))).toBe(true);
      expect(Number.isNaN(parseTimeToMinutes('abc'))).toBe(true);
      expect(Number.isNaN(parseTimeToMinutes(''))).toBe(true);
   });
});

describe('formatMinutesToTime', () => {
   it('formats minutes to HH:MM', () => {
      expect(formatMinutesToTime(540)).toBe('09:00');
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(1439)).toBe('23:59');
   });

   it('clamps out-of-range values', () => {
      expect(formatMinutesToTime(1500)).toBe('23:59');
      expect(formatMinutesToTime(-10)).toBe('00:00');
   });
});

describe('hasBirthdayCake', () => {
   it('detects cake by string id', () => {
      expect(hasBirthdayCake([{ product: { categoried_id: '3' } }])).toBe(true);
   });

   it('detects cake by numeric id', () => {
      expect(hasBirthdayCake([{ product: { categoried_id: 3 } }])).toBe(true);
   });

   it('detects cake in a mixed cart', () => {
      expect(
         hasBirthdayCake([
            { product: { categoried_id: '2' } },
            { product: { categoried_id: '3' } },
         ]),
      ).toBe(true);
   });

   it('returns false without cake', () => {
      expect(hasBirthdayCake([{ product: { categoried_id: '2' } }])).toBe(false);
      expect(hasBirthdayCake([])).toBe(false);
   });
});

describe('isCakeProduct', () => {
   it('returns true for cake category (string or numeric)', () => {
      expect(isCakeProduct({ categoried_id: '3' })).toBe(true);
      expect(isCakeProduct({ categoried_id: 3 })).toBe(true);
   });

   it('returns false for other categories', () => {
      expect(isCakeProduct({ categoried_id: '2' })).toBe(false);
      expect(isCakeProduct({ categoried_id: '1' })).toBe(false);
   });
});

describe('getUnavailableReason', () => {
   it('returns closed when now is past close', () => {
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: false, now: at(23, 0) }),
      ).toBe('closed');
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: true, now: at(23, 0) }),
      ).toBe('closed');
   });

   it('returns closed exactly at close', () => {
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: false, now: at(22, 0) }),
      ).toBe('closed');
   });

   it('returns cake when open but cake cannot fit before close', () => {
      // 21:00 + 3h = 24:00 > 22:00
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: true, now: at(21, 0) }),
      ).toBe('cake');
   });

   it('returns null when cake can still fit', () => {
      // 19:00 + 3h = 22:00 == close，刚好满足
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: true, now: at(19, 0) }),
      ).toBe(null);
   });

   it('returns null for normal orders during business hours', () => {
      expect(
         getUnavailableReason({ openTime: OPEN, closeTime: CLOSE, hasCake: false, now: at(14, 0) }),
      ).toBe(null);
      expect(
         getUnavailableReason({
            openTime: OPEN,
            closeTime: CLOSE,
            hasCake: false,
            now: at(21, 30),
         }),
      ).toBe(null);
   });
});

describe('earliestPickupMinutes', () => {
   it('adds 3h lead for cake', () => {
      // 14:00 + 3h = 17:00 (1020)
      expect(
         earliestPickupMinutes({ openTime: OPEN, closeTime: CLOSE, hasCake: true, now: at(14, 0) }),
      ).toBe(1020);
   });

   it('adds 1min for normal orders', () => {
      // 14:00 + 1min = 841
      expect(
         earliestPickupMinutes({
            openTime: OPEN,
            closeTime: CLOSE,
            hasCake: false,
            now: at(14, 0),
         }),
      ).toBe(841);
   });

   it('respects open time for normal orders before opening', () => {
      // 08:00 + 1min = 481，营业开始 09:00 (540) 更晚 → 取大 = 09:00
      expect(
         earliestPickupMinutes({ openTime: OPEN, closeTime: CLOSE, hasCake: false, now: at(8, 0) }),
      ).toBe(540);
   });

   it('uses now+3h for cake even when ordering before opening', () => {
      // 08:00 + 3h = 11:00 (660)，超过营业开始 09:00，蛋糕提前量生效
      expect(
         earliestPickupMinutes({ openTime: OPEN, closeTime: CLOSE, hasCake: true, now: at(8, 0) }),
      ).toBe(660);
   });
});

describe('validateOrderTime', () => {
   const base = { openTime: OPEN, closeTime: CLOSE, now: at(14, 0) };

   it('accepts a valid time within hours', () => {
      expect(validateOrderTime({ ...base, expectedTime: '18:30', hasCake: false }).valid).toBe(
         true,
      );
   });

   it('rejects before opening', () => {
      expect(validateOrderTime({ ...base, expectedTime: '08:30', hasCake: false }).valid).toBe(
         false,
      );
   });

   it('rejects after close', () => {
      expect(validateOrderTime({ ...base, expectedTime: '22:30', hasCake: false }).valid).toBe(
         false,
      );
   });

   it('rejects a past time', () => {
      const r = validateOrderTime({ ...base, expectedTime: '13:00', hasCake: false });
      expect(r.valid).toBe(false);
      expect(r.message).toContain('已过');
   });

   it('rejects cake booked less than 3h ahead', () => {
      const r = validateOrderTime({ ...base, expectedTime: '15:00', hasCake: true });
      expect(r.valid).toBe(false);
      expect(r.message).toContain('3 小时');
   });

   it('accepts cake booked exactly 3h ahead', () => {
      expect(validateOrderTime({ ...base, expectedTime: '17:00', hasCake: true }).valid).toBe(true);
   });

   it('accepts pickup exactly at close', () => {
      expect(validateOrderTime({ ...base, expectedTime: '22:00', hasCake: false }).valid).toBe(
         true,
      );
   });

   it('rejects invalid format', () => {
      expect(validateOrderTime({ ...base, expectedTime: '9:00', hasCake: false }).valid).toBe(
         false,
      );
   });
});
