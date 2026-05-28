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
   it.each(['普通用户', '会员用户'])('accepts %s', level => {
      expect(isValidUserLevel(level)).toBe(true);
   });

   it('rejects invalid levels', () => {
      expect(isValidUserLevel('黄金会员')).toBe(false);
      expect(isValidUserLevel('')).toBe(false);
   });
});

describe('getLevelForScore', () => {
   it('returns 普通用户 below 100', () => {
      expect(getLevelForScore(0)).toBe('普通用户');
      expect(getLevelForScore(99)).toBe('普通用户');
   });

   it('returns 会员用户 at 100+', () => {
      expect(getLevelForScore(100)).toBe('会员用户');
      expect(getLevelForScore(500)).toBe('会员用户');
   });
});
