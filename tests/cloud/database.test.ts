import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { isValidOrderStatus } from '../../weixin-cloud/utils/database';

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
