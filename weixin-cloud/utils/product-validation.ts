/**
 * Product and specification validation helpers.
 *
 * Pure functions exported for testability. Cloud-function entry points
 * delegate to these so validation logic can be unit-tested without
 * cloud SDK mocks.
 */

// ── Types ─────────────────────────────────────────────

export interface EditableSpecGroup {
   name: string;
   required: boolean;
   options: EditableSpecOption[];
}

export interface EditableSpecOption {
   name: string;
   sold_out?: boolean;
   [key: string]: unknown;
}

export interface ProductInput {
   name?: string;
   categoried_id?: string;
   description?: string;
   price?: number;
   image?: string;
   status?: boolean;
   specs?: EditableSpecGroup[] | string;
}

export interface StoredProduct extends ProductInput {
   _id: string;
   [key: string]: unknown;
}

// ── Specification normalization ───────────────────────

/**
 * Parse the admin editor's array-shaped specs into a normalized array.
 * Returns `undefined` for empty or invalid input.
 */
export function normalizeEditableSpecs(
   raw: EditableSpecGroup[] | string | undefined,
): EditableSpecGroup[] | undefined {
   if (!raw) return undefined;

   // Already an array of groups
   if (Array.isArray(raw)) {
      if (raw.length === 0) return undefined;
      return raw;
   }

   // JSON string
   if (typeof raw === 'string') {
      try {
         const parsed = JSON.parse(raw);
         if (Array.isArray(parsed) && parsed.length > 0) return parsed;
         return undefined;
      } catch {
         return undefined;
      }
   }

   return undefined;
}

/**
 * Convert edited groups to the canonical product specs record while preserving
 * supported option fields (for example `price`) from the stored record.
 */
export function mergeProductSpecs(
   stored: unknown,
   edited: EditableSpecGroup[] | undefined,
): Record<
   string,
   {
      name: string;
      required: boolean;
      options: Array<{ value: string; isSoldOut: boolean; [key: string]: unknown }>;
   }
> {
   const storedRecord = parseProductSpecs(stored);
   const storedLookup = new Map<string, Record<string, unknown>>();
   const storedGroupKeys = new Map<string, string>();
   for (const [groupKey, group] of Object.entries(storedRecord)) {
      storedGroupKeys.set(group.name, groupKey);
      for (const option of group.options ?? []) {
         storedLookup.set(`${group.name}::${option.value}`, option);
      }
   }

   const record: Record<
      string,
      {
         name: string;
         required: boolean;
         options: Array<{ value: string; isSoldOut: boolean; [key: string]: unknown }>;
      }
   > = {};

   for (const group of edited ?? []) {
      const groupKey = storedGroupKeys.get(group.name) ?? group.name;
      record[groupKey] = {
         name: group.name,
         required: group.required ?? false,
         options: (group.options ?? []).map(option => {
            const storedOption = storedLookup.get(`${group.name}::${option.name}`);
            return {
               ...storedOption,
               value: option.name,
               isSoldOut: option.sold_out ?? false,
            };
         }),
      };
   }
   return record;
}

/** Parse canonical product specs stored as a record or JSON string. */
export function parseProductSpecs(raw: unknown): Record<
   string,
   {
      name: string;
      required: boolean;
      options: Array<{ value: string; isSoldOut: boolean; [key: string]: unknown }>;
   }
> {
   let parsed = raw;
   if (typeof raw === 'string') {
      try {
         parsed = JSON.parse(raw);
      } catch {
         return {};
      }
   }
   if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
   return parsed as Record<
      string,
      {
         name: string;
         required: boolean;
         options: Array<{ value: string; isSoldOut: boolean; [key: string]: unknown }>;
      }
   >;
}

// ── Product field validation ──────────────────────────

export interface ValidationResult {
   valid: boolean;
   message: string;
}

const MAX_IMAGE_LENGTH = 256;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

export function validateProductCreate(input: ProductInput): ValidationResult {
   if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
      return { valid: false, message: '商品名称不能为空' };
   }
   if (input.name.length > MAX_NAME_LENGTH) {
      return { valid: false, message: `商品名称不能超过${MAX_NAME_LENGTH}个字符` };
   }
   if (input.categoried_id == null || String(input.categoried_id).trim().length === 0) {
      return { valid: false, message: '请选择商品分类' };
   }
   if (
      input.price == null ||
      typeof input.price !== 'number' ||
      input.price < 0 ||
      !Number.isFinite(input.price)
   ) {
      return { valid: false, message: '请输入有效的商品价格' };
   }
   if (
      input.image != null &&
      typeof input.image === 'string' &&
      input.image.length > MAX_IMAGE_LENGTH
   ) {
      return { valid: false, message: `图片文件名不能超过${MAX_IMAGE_LENGTH}个字符` };
   }
   if (
      input.description != null &&
      typeof input.description === 'string' &&
      input.description.length > MAX_DESCRIPTION_LENGTH
   ) {
      return { valid: false, message: `商品描述不能超过${MAX_DESCRIPTION_LENGTH}个字符` };
   }

   const specResult = validateSpecsInput(input.specs);
   if (!specResult.valid) return specResult;

   return { valid: true, message: '' };
}

export function validateProductUpdate(
   input: Partial<ProductInput> & { _id?: string },
): ValidationResult {
   if (!input._id || typeof input._id !== 'string' || input._id.trim().length === 0) {
      return { valid: false, message: '商品ID不能为空' };
   }

   if (input.name !== undefined) {
      if (typeof input.name !== 'string' || input.name.trim().length === 0) {
         return { valid: false, message: '商品名称不能为空' };
      }
      if (input.name.length > MAX_NAME_LENGTH) {
         return { valid: false, message: `商品名称不能超过${MAX_NAME_LENGTH}个字符` };
      }
   }

   if (input.categoried_id !== undefined) {
      if (String(input.categoried_id).trim().length === 0) {
         return { valid: false, message: '请选择商品分类' };
      }
   }

   if (input.price !== undefined) {
      if (typeof input.price !== 'number' || input.price < 0 || !Number.isFinite(input.price)) {
         return { valid: false, message: '请输入有效的商品价格' };
      }
   }

   if (
      input.image !== undefined &&
      typeof input.image === 'string' &&
      input.image.length > MAX_IMAGE_LENGTH
   ) {
      return { valid: false, message: `图片文件名不能超过${MAX_IMAGE_LENGTH}个字符` };
   }

   if (
      input.description !== undefined &&
      typeof input.description === 'string' &&
      input.description.length > MAX_DESCRIPTION_LENGTH
   ) {
      return { valid: false, message: `商品描述不能超过${MAX_DESCRIPTION_LENGTH}个字符` };
   }

   const specResult = validateSpecsInput(input.specs);
   if (!specResult.valid) return specResult;

   return { valid: true, message: '' };
}

function validateSpecsInput(raw: EditableSpecGroup[] | string | undefined): ValidationResult {
   if (raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0)) {
      return { valid: true, message: '' };
   }
   const specs = normalizeEditableSpecs(raw);
   if (!specs) return { valid: false, message: '商品规格格式不正确' };
   return validateSpecGroups(specs);
}

function validateSpecGroups(specs: EditableSpecGroup[]): ValidationResult {
   const groupNames = new Set<string>();
   for (const group of specs) {
      if (
         !group ||
         typeof group !== 'object' ||
         typeof group.name !== 'string' ||
         !group.name.trim()
      ) {
         return { valid: false, message: '规格组名称不能为空' };
      }
      if (groupNames.has(group.name)) {
         return { valid: false, message: `规格组「${group.name}」重复` };
      }
      groupNames.add(group.name);
      if (!Array.isArray(group.options)) {
         return { valid: false, message: `规格组「${group.name}」的选项格式不正确` };
      }
      const optionNames = new Set<string>();
      for (const opt of group.options) {
         if (!opt || typeof opt !== 'object' || typeof opt.name !== 'string' || !opt.name.trim()) {
            return { valid: false, message: `规格组「${group.name}」中有未命名的选项` };
         }
         if (optionNames.has(opt.name)) {
            return { valid: false, message: `规格组「${group.name}」中选项「${opt.name}」重复` };
         }
         optionNames.add(opt.name);
      }
   }
   return { valid: true, message: '' };
}
