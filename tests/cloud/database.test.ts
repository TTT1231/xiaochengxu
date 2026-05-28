import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { isValidOrderStatus, isValidUserLevel, getLevelForScore } from '../../weixin-cloud/utils/database';

describe('isValidOrderStatus', () => {
   it.each(['pending', 'preparing', 'ready', 'completed', 'cancelled'])('accepts %s', status => {
      expect(isValidOrderStatus(status)).toBe(true);
   });

   it('rejects invalid statuses', () => {
      expect(isValidOrderStatus('shipped')).toBe(false);
      expect(isValidOrderStatus('')).toBe(false);
      expect(isValidOrderStatus('PENDING')).toBe(false);
   });
});

describe('isValidUserLevel', () => {
   it.each(['普通会员', '黄铜会员', '白银会员', '黄金会员'])('accepts %s', level => {
      expect(isValidUserLevel(level)).toBe(true);
   });

   it('rejects invalid levels', () => {
      expect(isValidUserLevel('钻石会员')).toBe(false);
      expect(isValidUserLevel('')).toBe(false);
   });
});

describe('getLevelForScore', () => {
   it('returns 普通会员 below 100', () => {
      expect(getLevelForScore(0)).toBe('普通会员');
      expect(getLevelForScore(99)).toBe('普通会员');
   });

   it('returns 黄铜会员 at 100–199', () => {
      expect(getLevelForScore(100)).toBe('黄铜会员');
      expect(getLevelForScore(199)).toBe('黄铜会员');
   });

   it('returns 白银会员 at 200–299', () => {
      expect(getLevelForScore(200)).toBe('白银会员');
      expect(getLevelForScore(299)).toBe('白银会员');
   });

   it('returns 黄金会员 at 300+', () => {
      expect(getLevelForScore(300)).toBe('黄金会员');
      expect(getLevelForScore(1000)).toBe('黄金会员');
   });
});
