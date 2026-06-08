import { describe, it, expect } from 'vitest';
import { getItemDiscount } from '../../src/utils/discount';

describe('getItemDiscount', () => {
   it('returns 0 for non-VIP users', () => {
      expect(getItemDiscount(10, '2', false)).toBe(0);
   });

   it('returns 0 for non-category-2 products even if VIP', () => {
      expect(getItemDiscount(10, '1', true)).toBe(0);
      expect(getItemDiscount(10, '3', true)).toBe(0);
   });

   it('returns price * 0.12 for VIP + category 2', () => {
      expect(getItemDiscount(10, '2', true)).toBe(1.2);
      expect(getItemDiscount(25, '2', true)).toBe(3);
   });

   it('handles numeric categoryId', () => {
      expect(getItemDiscount(10, 2, true)).toBe(1.2);
   });

   it('rounds to 2 decimal places', () => {
      expect(getItemDiscount(0.01, '2', true)).toBe(0);
      expect(getItemDiscount(3.33, '2', true)).toBe(0.4); // 3.33 * 0.12 = 0.3996 → rounds to 0.40
      expect(getItemDiscount(1.11, '2', true)).toBe(0.13);
   });

   it('returns 0 when price is 0', () => {
      expect(getItemDiscount(0, '2', true)).toBe(0);
   });
});
