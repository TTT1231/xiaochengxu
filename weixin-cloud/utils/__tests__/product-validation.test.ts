import { describe, it, expect } from 'vitest';
import {
   normalizeEditableSpecs,
   mergeProductSpecs,
   parseProductSpecs,
   validateProductCreate,
   validateProductUpdate,
   type EditableSpecGroup,
} from '../product-validation';

// ── normalizeEditableSpecs ────────────────────────────

describe('normalizeEditableSpecs', () => {
   it('returns undefined for undefined input', () => {
      expect(normalizeEditableSpecs(undefined)).toBeUndefined();
   });

   it('returns undefined for empty array', () => {
      expect(normalizeEditableSpecs([])).toBeUndefined();
   });

   it('returns undefined for empty string', () => {
      expect(normalizeEditableSpecs('')).toBeUndefined();
   });

   it('returns undefined for invalid JSON string', () => {
      expect(normalizeEditableSpecs('{not json')).toBeUndefined();
   });

   it('returns undefined for JSON string of non-array', () => {
      expect(normalizeEditableSpecs('{"key": "value"}')).toBeUndefined();
   });

   it('returns undefined for JSON string of empty array', () => {
      expect(normalizeEditableSpecs('[]')).toBeUndefined();
   });

   it('parses a valid JSON string into editable groups', () => {
      const input = JSON.stringify([
         { name: 'Size', required: true, options: [{ name: 'Large' }, { name: 'Small' }] },
      ]);
      const result = normalizeEditableSpecs(input);
      expect(result).toHaveLength(1);
      expect(result![0].name).toBe('Size');
      expect(result![0].options).toHaveLength(2);
   });

   it('returns an existing editable group array directly', () => {
      const groups: EditableSpecGroup[] = [
         { name: 'Temperature', required: false, options: [{ name: 'Hot' }] },
      ];
      expect(normalizeEditableSpecs(groups)).toEqual(groups);
   });
});

// ── mergeProductSpecs ─────────────────────────────────

describe('mergeProductSpecs', () => {
   it('converts edited specs to the canonical record', () => {
      const edited: EditableSpecGroup[] = [
         { name: 'Size', required: true, options: [{ name: 'L' }] },
      ];
      expect(mergeProductSpecs(undefined, edited)).toEqual({
         Size: {
            name: 'Size',
            required: true,
            options: [{ value: 'L', isSoldOut: false }],
         },
      });
   });

   it('returns an empty record when edited is undefined', () => {
      expect(mergeProductSpecs(undefined, undefined)).toEqual({});
   });

   it('preserves supported fields from canonical stored options', () => {
      const stored = JSON.stringify({
         Size: {
            name: 'Size',
            required: true,
            options: [
               { value: 'Large', isSoldOut: false, price: 5, someLegacyField: 'keep-me' },
               { value: 'Small', isSoldOut: false, price: 0 },
            ],
         },
      });

      const edited: EditableSpecGroup[] = [
         {
            name: 'Size',
            required: true,
            options: [{ name: 'Large', sold_out: true }, { name: 'Small' }],
         },
      ];

      const result = mergeProductSpecs(stored, edited);

      const largeOpt = result.Size.options.find(o => o.value === 'Large')!;
      expect(largeOpt.isSoldOut).toBe(true);
      expect(largeOpt.price).toBe(5);
      expect(largeOpt.someLegacyField).toBe('keep-me');

      const smallOpt = result.Size.options.find(o => o.value === 'Small')!;
      expect(smallOpt.price).toBe(0);
   });

   it('uses canonical value and sold-out fields from the edit', () => {
      const stored = {
         Size: {
            name: 'Size',
            required: false,
            options: [{ value: 'Large', isSoldOut: false, price: 5 }],
         },
      };

      const edited: EditableSpecGroup[] = [
         {
            name: 'Size',
            required: true,
            options: [{ name: 'Large', sold_out: true }],
         },
      ];

      const result = mergeProductSpecs(stored, edited);
      expect(result.Size.options[0]).toEqual({ value: 'Large', isSoldOut: true, price: 5 });
   });

   it('preserves the stored group key when the display name matches', () => {
      const stored = {
         packaging: {
            name: '包装',
            required: false,
            options: [{ value: '普通包装', isSoldOut: false }],
         },
      };
      const result = mergeProductSpecs(stored, [
         { name: '包装', required: true, options: [{ name: '普通包装', sold_out: false }] },
      ]);
      expect(Object.keys(result)).toEqual(['packaging']);
   });
});

describe('parseProductSpecs', () => {
   it('parses a canonical JSON string', () => {
      expect(parseProductSpecs('{"Size":{"name":"Size","required":true,"options":[]}}')).toEqual({
         Size: { name: 'Size', required: true, options: [] },
      });
   });

   it('rejects the old editable array shape', () => {
      expect(parseProductSpecs('[{"name":"Size","options":[]} ]')).toEqual({});
   });
});

// ── validateProductCreate ─────────────────────────────

describe('validateProductCreate', () => {
   const validInput = {
      name: 'Test Product',
      categoried_id: 'cat-1',
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

   it('rejects missing categoried_id', () => {
      expect(validateProductCreate({ ...validInput, categoried_id: '' }).valid).toBe(false);
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

   it('rejects specs with empty group name', () => {
      const result = validateProductCreate({
         ...validInput,
         specs: [{ name: '', required: true, options: [{ name: 'A' }] }],
      });
      expect(result.valid).toBe(false);
   });

   it('rejects specs with unnamed option', () => {
      const result = validateProductCreate({
         ...validInput,
         specs: [{ name: 'Size', required: true, options: [{ name: '' }] }],
      });
      expect(result.valid).toBe(false);
   });

   it('accepts product with valid specs', () => {
      expect(
         validateProductCreate({
            ...validInput,
            specs: [{ name: 'Size', required: true, options: [{ name: 'Large' }] }],
         }).valid,
      ).toBe(true);
   });

   it('accepts an empty specs array to clear specs', () => {
      expect(validateProductCreate({ ...validInput, specs: [] }).valid).toBe(true);
   });

   it('rejects malformed specs JSON', () => {
      expect(validateProductCreate({ ...validInput, specs: '{broken' }).valid).toBe(false);
   });

   it('rejects duplicate groups and options', () => {
      expect(
         validateProductCreate({
            ...validInput,
            specs: [{ name: 'Size', required: true, options: [{ name: 'L' }, { name: 'L' }] }],
         }).valid,
      ).toBe(false);
      expect(
         validateProductCreate({
            ...validInput,
            specs: [
               { name: 'Size', required: true, options: [] },
               { name: 'Size', required: false, options: [] },
            ],
         }).valid,
      ).toBe(false);
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

   it('rejects empty categoried_id when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', categoried_id: '' }).valid).toBe(false);
   });

   it('rejects whitespace categoried_id when provided', () => {
      expect(validateProductUpdate({ _id: 'p1', categoried_id: '   ' }).valid).toBe(false);
   });

   it('accepts valid categoried_id update', () => {
      expect(validateProductUpdate({ _id: 'p1', categoried_id: 'cat-2' }).valid).toBe(true);
   });
});
