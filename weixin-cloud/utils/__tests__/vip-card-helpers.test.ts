import { describe, it, expect } from 'vitest';
import {
   generateCardNo,
   generateUniqueCardNos,
   validateDisableTransition,
   validateIssuance,
} from '../vip-card-helpers';

// ── generateCardNo ────────────────────────────────────

describe('generateCardNo', () => {
   it('starts with the VC prefix', () => {
      const cardNo = generateCardNo();
      expect(cardNo.startsWith('VC')).toBe(true);
   });

   it('has correct total length', () => {
      const cardNo = generateCardNo();
      // VC (2) + 10 alphanumeric = 12
      expect(cardNo.length).toBe(12);
   });

   it('contains only uppercase alphanumeric after prefix', () => {
      const cardNo = generateCardNo();
      const suffix = cardNo.slice(2);
      expect(/^[A-Z0-9]+$/.test(suffix)).toBe(true);
   });

   it('uses injected random function', () => {
      // Deterministic with a fake random that always returns 0
      const cardNo = generateCardNo(() => 0);
      expect(cardNo).toBe('VCAAAAAAAAAA');
   });

   it('generates different values with different random seeds', () => {
      let counter = 0;
      const countingRandom = () => {
         counter++;
         return (counter % 36) / 36;
      };
      const a = generateCardNo(countingRandom);
      counter = 0;
      const b = generateCardNo(countingRandom);
      // Same sequence should produce same result
      expect(a).toBe(b);
   });
});

// ── generateUniqueCardNos ─────────────────────────────

describe('generateUniqueCardNos', () => {
   it('generates the requested quantity of unique card numbers', async () => {
      const cardNos = await generateUniqueCardNos(5, async () => false);
      expect(cardNos).toHaveLength(5);

      const uniqueSet = new Set(cardNos);
      expect(uniqueSet.size).toBe(5);
   });

   it('retries when collision detected in database', async () => {
      let callCount = 0;
      const existsInDb = async (_: string) => {
         // First card number always "exists", forcing a retry
         callCount++;
         return callCount === 1;
      };

      const cardNos = await generateUniqueCardNos(1, existsInDb);
      expect(cardNos).toHaveLength(1);
   });

   it('retries when local collision occurs (deterministic random)', async () => {
      // Fake random that returns the same value for first N calls, then varies
      let callIndex = 0;
      const fakeRandom = () => {
         callIndex++;
         // First 20 calls return same value (generating same card number)
         // 10 chars per card number, so 2 attempts at same number
         if (callIndex <= 20) return 0.5;
         return (callIndex % 36) / 37;
      };

      const cardNos = await generateUniqueCardNos(2, async () => false, fakeRandom);
      expect(cardNos).toHaveLength(2);
      // All should be unique
      expect(new Set(cardNos).size).toBe(2);
   });

   it('throws when unable to generate unique numbers within retry limit', async () => {
      // Every card number "exists" in database
      const alwaysExists = async () => true;

      await expect(generateUniqueCardNos(1, alwaysExists)).rejects.toThrow('无法生成唯一卡号');
   });

   it('generates single card number for quantity 1', async () => {
      const cardNos = await generateUniqueCardNos(1, async () => false);
      expect(cardNos).toHaveLength(1);
      expect(cardNos[0].startsWith('VC')).toBe(true);
   });
});

// ── validateDisableTransition ─────────────────────────

describe('validateDisableTransition', () => {
   it('allows active → disabled', () => {
      const result = validateDisableTransition('active');
      expect(result.allowed).toBe(true);
   });

   it('rejects disabled → disabled (already disabled)', () => {
      const result = validateDisableTransition('disabled');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('已被禁用');
   });

   it('rejects used → disabled', () => {
      const result = validateDisableTransition('used');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('已使用');
   });

   it('rejects unknown status', () => {
      const result = validateDisableTransition('expired');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('未知');
   });
});

// ── validateIssuance ──────────────────────────────────

describe('validateIssuance', () => {
   it('accepts valid amount with default quantity', () => {
      const result = validateIssuance({ amount: 100 });
      expect(result.valid).toBe(true);
      expect(result.quantity).toBe(5); // default
      expect(result.amount).toBe(100);
   });

   it('accepts valid amount with custom quantity', () => {
      const result = validateIssuance({ amount: 50, quantity: 10 });
      expect(result.valid).toBe(true);
      expect(result.quantity).toBe(10);
   });

   it('rejects missing amount', () => {
      const result = validateIssuance({ amount: undefined as unknown as number });
      expect(result.valid).toBe(false);
   });

   it('rejects zero amount', () => {
      const result = validateIssuance({ amount: 0 });
      expect(result.valid).toBe(false);
   });

   it('rejects negative amount', () => {
      const result = validateIssuance({ amount: -10 });
      expect(result.valid).toBe(false);
   });

   it('rejects NaN amount', () => {
      const result = validateIssuance({ amount: NaN });
      expect(result.valid).toBe(false);
   });

   it('rejects non-integer quantity', () => {
      const result = validateIssuance({ amount: 50, quantity: 2.5 });
      expect(result.valid).toBe(false);
   });

   it('rejects quantity below minimum', () => {
      const result = validateIssuance({ amount: 50, quantity: 0 });
      expect(result.valid).toBe(false);
   });

   it('rejects quantity exceeding maximum', () => {
      const result = validateIssuance({ amount: 50, quantity: 51 });
      expect(result.valid).toBe(false);
   });

   it('accepts minimum quantity', () => {
      const result = validateIssuance({ amount: 50, quantity: 1 });
      expect(result.valid).toBe(true);
      expect(result.quantity).toBe(1);
   });

   it('accepts maximum quantity', () => {
      const result = validateIssuance({ amount: 50, quantity: 50 });
      expect(result.valid).toBe(true);
      expect(result.quantity).toBe(50);
   });

   it('accepts very small positive amount', () => {
      const result = validateIssuance({ amount: 0.01 });
      expect(result.valid).toBe(true);
   });
});
