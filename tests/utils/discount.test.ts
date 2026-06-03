import { describe, it, expect } from 'vitest';
import { getItemDiscount } from '../../src/utils/discount';

describe('getItemDiscount', () => {
   it('returns 0 for non-VIP users', () => {
      expect(getItemDiscount(10, '5', false)).toBe(0);
   });

   it('returns 0 for non-category-5 products even if VIP', () => {
      expect(getItemDiscount(10, '1', true)).toBe(0);
      expect(getItemDiscount(10, '3', true)).toBe(0);
   });

   it('returns price * 0.2 for VIP + category 5', () => {
      expect(getItemDiscount(10, '5', true)).toBe(2);
      expect(getItemDiscount(25, '5', true)).toBe(5);
   });

   it('handles numeric categoryId', () => {
      expect(getItemDiscount(10, 5, true)).toBe(2);
   });

   it('rounds to 2 decimal places', () => {
      expect(getItemDiscount(0.01, '5', true)).toBe(0);
      expect(getItemDiscount(3.33, '5', true)).toBe(0.67); // 3.33 * 0.2 = 0.666 → rounds to 0.67
      expect(getItemDiscount(1.11, '5', true)).toBe(0.22);
   });

   it('returns 0 when price is 0', () => {
      expect(getItemDiscount(0, '5', true)).toBe(0);
   });
});
