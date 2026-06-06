/**
 * Product and specification validation helpers.
 *
 * Pure functions exported for testability. Cloud-function entry points
 * delegate to these so validation logic can be unit-tested without
 * cloud SDK mocks.
 */

// ── Types ─────────────────────────────────────────────

export interface SpecGroup {
   name: string;
   required: boolean;
   options: SpecOption[];
}

export interface SpecOption {
   name: string;
   sold_out?: boolean;
   /** Legacy fields preserved when option is retained in an edit */
   [key: string]: unknown;
}

export interface ProductInput {
   name?: string;
   category_id?: string;
   description?: string;
   price?: number;
   image?: string;
   status?: boolean;
   specifications?: SpecGroup[] | string;
}

export interface StoredProduct extends ProductInput {
   _id: string;
   specifications?: SpecGroup[] | string;
   [key: string]: unknown;
}

// ── Specification normalization ───────────────────────

/**
 * Parse legacy JSON-string or object specifications into a normalized
 * SpecGroup array. Returns `undefined` for empty / invalid specs.
 */
export function normalizeSpecifications(
   raw: SpecGroup[] | string | undefined,
): SpecGroup[] | undefined {
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
 * Merge edited specification groups into the stored specifications,
 * preserving supported legacy option fields that remain present in
 * the edited options.
 */
export function mergeSpecifications(
   stored: SpecGroup[] | string | undefined,
   edited: SpecGroup[] | undefined,
): SpecGroup[] | undefined {
   const normalized = normalizeSpecifications(stored);
   if (!edited || edited.length === 0) return edited;

   if (!normalized) return edited;

   // Build a lookup of stored options by group name + option name
   const storedLookup = new Map<string, SpecOption>();
   for (const group of normalized) {
      for (const option of group.options ?? []) {
         storedLookup.set(`${group.name}::${option.name}`, option);
      }
   }

   // Merge legacy fields from stored into edited options
   for (const group of edited) {
      for (let i = 0; i < (group.options ?? []).length; i++) {
         const key = `${group.name}::${group.options[i].name}`;
         const storedOpt = storedLookup.get(key);
         if (storedOpt) {
            // Preserve legacy fields from stored that aren't in the edited version
            for (const [field, value] of Object.entries(storedOpt)) {
               if (!(field in group.options[i])) {
                  group.options[i][field] = value;
               }
            }
         }
      }
   }

   return edited;
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
   if (input.category_id == null || String(input.category_id).trim().length === 0) {
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

   // Validate specifications structure if provided
   if (input.specifications) {
      const specs = normalizeSpecifications(input.specifications);
      if (specs) {
         const specResult = validateSpecGroups(specs);
         if (!specResult.valid) return specResult;
      }
   }

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

   if (input.category_id !== undefined) {
      if (String(input.category_id).trim().length === 0) {
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

   // Validate specifications structure if provided
   if (input.specifications) {
      const specs = normalizeSpecifications(input.specifications);
      if (specs) {
         const specResult = validateSpecGroups(specs);
         if (!specResult.valid) return specResult;
      }
   }

   return { valid: true, message: '' };
}

function validateSpecGroups(specs: SpecGroup[]): ValidationResult {
   for (const group of specs) {
      if (!group.name || typeof group.name !== 'string' || group.name.trim().length === 0) {
         return { valid: false, message: '规格组名称不能为空' };
      }
      if (!Array.isArray(group.options)) {
         return { valid: false, message: `规格组「${group.name}」的选项格式不正确` };
      }
      for (const opt of group.options) {
         if (!opt.name || typeof opt.name !== 'string' || opt.name.trim().length === 0) {
            return { valid: false, message: `规格组「${group.name}」中有未命名的选项` };
         }
      }
   }
   return { valid: true, message: '' };
}
