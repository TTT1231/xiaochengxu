import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { rechargeWallet, deductWallet, refundWallet } from '../../weixin-cloud/utils/wallet';

describe('rechargeWallet', () => {
   it('adds amount to balance and total_recharged', () => {
      const wallet = { balance: 10, total_recharged: 50 };
      const result = rechargeWallet(wallet, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(70);
   });

   it('throws on non-positive amount', () => {
      expect(() => rechargeWallet({ balance: 10, total_recharged: 50 }, 0)).toThrow();
      expect(() => rechargeWallet({ balance: 10, total_recharged: 50 }, -5)).toThrow();
   });
});

describe('deductWallet', () => {
   it('deducts amount from balance', () => {
      const result = deductWallet({ balance: 50, total_recharged: 100 }, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(100);
   });

   it('throws when deducting more than balance', () => {
      expect(() => deductWallet({ balance: 10, total_recharged: 50 }, 20)).toThrow();
   });

   it('throws on negative amount', () => {
      expect(() => deductWallet({ balance: 50, total_recharged: 100 }, -1)).toThrow();
   });

   it('allows deducting exact balance', () => {
      const result = deductWallet({ balance: 50, total_recharged: 100 }, 50);
      expect(result.balance).toBe(0);
   });
});

describe('refundWallet', () => {
   it('adds refund amount back to balance', () => {
      const result = refundWallet({ balance: 10, total_recharged: 100 }, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(100);
   });

   it('throws on negative refund', () => {
      expect(() => refundWallet({ balance: 10, total_recharged: 100 }, -5)).toThrow();
   });
});
