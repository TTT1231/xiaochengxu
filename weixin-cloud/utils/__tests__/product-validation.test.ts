import { describe, it, expect } from 'vitest';
import {
   normalizeSpecifications,
   mergeSpecifications,
   validateProductCreate,
   validateProductUpdate,
   type SpecGroup,
} from '../product-validation';

// ── normalizeSpecifications ───────────────────────────

describe('normalizeSpecifications', () => {
   it('returns undefined for undefined input', () => {
      expect(normalizeSpecifications(undefined)).toBeUndefined();
   });

   it('returns undefined for empty array', () => {
      expect(normalizeSpecifications([])).toBeUndefined();
   });

   it('returns undefined for empty string', () => {
      expect(normalizeSpecifications('')).toBeUndefined();
   });

   it('returns undefined for invalid JSON string', () => {
      expect(normalizeSpecifications('{not json')).toBeUndefined();
   });

   it('returns undefined for JSON string of non-array', () => {
      expect(normalizeSpecifications('{"key": "value"}')).toBeUndefined();
   });

   it('returns undefined for JSON string of empty array', () => {
      expect(normalizeSpecifications('[]')).toBeUndefined();
   });

   it('parses valid JSON string into SpecGroup array', () => {
      const input = JSON.stringify([
         { name: 'Size', required: true, options: [{ name: 'Large' }, { name: 'Small' }] },
      ]);
      const result = normalizeSpecifications(input);
      expect(result).toHaveLength(1);
      expect(result![0].name).toBe('Size');
      expect(result![0].options).toHaveLength(2);
   });

   it('returns array directly when input is already SpecGroup[]', () => {
      const groups: SpecGroup[] = [
         { name: 'Temperature', required: false, options: [{ name: 'Hot' }] },
      ];
      expect(normalizeSpecifications(groups)).toEqual(groups);
   });
});

// ── mergeSpecifications ───────────────────────────────

describe('mergeSpecifications', () => {
   it('returns edited specs when stored is undefined', () => {
      const edited: SpecGroup[] = [{ name: 'Size', required: true, options: [{ name: 'L' }] }];
      expect(mergeSpecifications(undefined, edited)).toEqual(edited);
   });

   it('returns undefined when edited is undefined', () => {
      expect(
         mergeSpecifications([{ name: 'X', required: false, options: [] }], undefined),
      ).toBeUndefined();
   });

   it('preserves legacy fields from stored options into edited options', () => {
      const stored: SpecGroup[] = [
         {
            name: 'Size',
            required: true,
            options: [
               { name: 'Large', price: 5, someLegacyField: 'keep-me' },
               { name: 'Small', price: 0 },
            ],
         },
      ];

      const edited: SpecGroup[] = [
         {
            name: 'Size',
            required: true,
            options: [{ name: 'Large', sold_out: true }, { name: 'Small' }],
         },
      ];

      const result = mergeSpecifications(stored, edited)!;

      // Large: gets legacy price + someLegacyField merged in
      const largeOpt = result[0].options.find(o => o.name === 'Large')!;
      expect(largeOpt.sold_out).toBe(true);
      expect(largeOpt.price).toBe(5);
      expect(largeOpt.someLegacyField).toBe('keep-me');

      // Small: gets legacy price merged in
      const smallOpt = result[0].options.find(o => o.name === 'Small')!;
      expect(smallOpt.price).toBe(0);
   });

   it('does not overwrite edited fields with stored values', () => {
      const stored: SpecGroup[] = [
         {
            name: 'Size',
            required: false,
            options: [{ name: 'Large', price: 5 }],
         },
      ];

      const edited: SpecGroup[] = [
         {
            name: 'Size',
            required: true,
            options: [{ name: 'Large', price: 10 }],
         },
      ];

      const result = mergeSpecifications(stored, edited)!;
      // Edited price (10) should win over stored price (5)
      expect(result[0].options[0].price).toBe(10);
   });
});

// ── validateProductCreate ─────────────────────────────

describe('validateProductCreate', () => {
   const validInput = {
      name: 'Test Product',
      category_id: 'cat-1',
      price: 9.99,
   };

   it('accepts valid product input', () => {
      expect(validateProductCreate(validInput)).toEqual({ valid: true, message: '' });
   });

   it('rejects missing name', () => {
      expect(validateProductCreate({ ...validInput, name: '' }).valid).toBe(false);
   });

   it('rejects whitespace-only name', () => {
      expect(validateProductCreate({ ...validInput, name: '   ' }).valid).toBe(false);
   });

   it('rejects name exceeding max length', () => {
      expect(validateProductCreate({ ...validInput, name: 'x'.repeat(101) }).valid).toBe(false);
   });

   it('rejects missing category_id', () => {
      expect(validateProductCreate({ ...validInput, category_id: '' }).valid).toBe(false);
   });

   it('rejects missing price', () => {
      expect(
         validateProductCreate({ ...validInput, price: undefined as unknown as number }).valid,
      ).toBe(false);
   });

   it('rejects negative price', () => {
      expect(validateProductCreate({ ...validInput, price: -1 }).valid).toBe(false);
   });

   it('rejects NaN price', () => {
      expect(validateProductCreate({ ...validInput, price: NaN }).valid).toBe(false);
   });

   it('rejects Infinity price', () => {
      expect(validateProductCreate({ ...validInput, price: Infinity }).valid).toBe(false);
   });

   it('accepts zero price', () => {
      expect(validateProductCreate({ ...validInput, price: 0 }).valid).toBe(true);
   });

   it('rejects image filename exceeding max length', () => {
      expect(validateProductCreate({ ...validInput, image: 'x'.repeat(257) }).valid).toBe(false);
   });

   it('rejects description exceeding max length', () => {
      expect(validateProductCreate({ ...validInput, description: 'x'.repeat(1001) }).valid).toBe(
         false,
      );
   });

   it('rejects specifications with empty group name', () => {
      const result = validateProductCreate({
         ...validInput,
         specifications: [{ name: '', required: true, options: [{ name: 'A' }] }],
      });
      expect(result.valid).toBe(false);
   });

   it('rejects specifications with unnamed option', () => {
      const result = validateProductCreate({
         ...validInput,
         specifications: [{ name: 'Size', required: true, options: [{ name: '' }] }],
      });
      expect(result.valid).toBe(false);
   });

   it('accepts product with valid specifications', () => {
      expect(
         validateProductCreate({
            ...validInput,
            specifications: [{ name: 'Size', required: true, options: [{ name: 'Large' }] }],
         }).valid,
      ).toBe(true);
   });
});

// ── validateProductUpdate ─────────────────────────────

describe('validateProductUpdate', () => {
   it('rejects missing _id', () => {
      expect(validateProductUpdate({ name: 'X' }).valid).toBe(false);
   });

   it('accepts update with only _id and name', () => {
      expect(validateProductUpdate({ _id: 'p1', name: 'New Name' }).valid).toBe(true);
   });

   it('validates name when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', name: '' }).valid).toBe(false);
   });

   it('validates price when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', price: -5 }).valid).toBe(false);
   });

   it('allows updating only image', () => {
      expect(validateProductUpdate({ _id: 'p1', image: 'new.png' }).valid).toBe(true);
   });

   it('rejects empty category_id when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', category_id: '' }).valid).toBe(false);
   });

   it('rejects whitespace category_id when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', category_id: '   ' }).valid).toBe(false);
   });

   it('accepts valid category_id update', () => {
      expect(validateProductUpdate({ _id: 'p1', category_id: 'cat-2' }).valid).toBe(true);
   });
});
