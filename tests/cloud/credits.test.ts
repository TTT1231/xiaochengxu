import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { addPoints, subtractPoints, calculateCreditsEarned, getUpdatedLevel } from '../../weixin-cloud/utils/credits';

describe('addPoints', () => {
   it('adds points to both total_scores and available_scores', () => {
      expect(addPoints({ total_scores: 100, available_scores: 50 }, 30)).toEqual({
         total_scores: 130,
         available_scores: 80,
      });
   });

   it('handles zero points', () => {
      expect(addPoints({ total_scores: 100, available_scores: 50 }, 0)).toEqual({
         total_scores: 100,
         available_scores: 50,
      });
   });
});

describe('subtractPoints', () => {
   it('subtracts from both fields', () => {
      expect(subtractPoints({ total_scores: 100, available_scores: 80 }, 30)).toEqual({
         total_scores: 70,
         available_scores: 50,
      });
   });

   it('floors total_scores at 0', () => {
      const r = subtractPoints({ total_scores: 10, available_scores: 50 }, 30);
      expect(r.total_scores).toBe(0);
      expect(r.available_scores).toBe(20);
   });

   it('floors available_scores at 0', () => {
      const r = subtractPoints({ total_scores: 50, available_scores: 10 }, 30);
      expect(r.available_scores).toBe(0);
      expect(r.total_scores).toBe(20);
   });

   it('floors both at 0 when subtraction exceeds both', () => {
      expect(subtractPoints({ total_scores: 5, available_scores: 3 }, 100)).toEqual({
         total_scores: 0,
         available_scores: 0,
      });
   });
});

describe('calculateCreditsEarned', () => {
   it('returns total minus discount', () => {
      expect(calculateCreditsEarned(100, 20)).toBe(80);
   });

   it('returns full total with no discount', () => {
      expect(calculateCreditsEarned(100, 0)).toBe(100);
   });
});

describe('getUpdatedLevel', () => {
   it('returns null when level unchanged', () => {
      expect(getUpdatedLevel('普通用户', 50)).toBeNull();
   });

   it('returns new level when threshold crossed', () => {
      expect(getUpdatedLevel('普通用户', 100)).toBe('会员用户');
   });

   it('returns null when already at matching level', () => {
      expect(getUpdatedLevel('会员用户', 150)).toBeNull();
   });
});
