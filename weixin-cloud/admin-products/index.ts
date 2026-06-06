import { db } from '../utils/database';
import { authorizeAdmin, AuthorizationError } from '../utils/admin-auth';
import {
   normalizeSpecifications,
   mergeSpecifications,
   validateProductCreate,
   validateProductUpdate,
   type ProductInput,
   type SpecGroup,
} from '../utils/product-validation';

// ── Types ─────────────────────────────────────────────

interface ListParams {
   action: 'list';
   pageSize?: number;
   page?: number;
}

interface CreateParams {
   action: 'create';
   name: string;
   category_id: string;
   description?: string;
   price: number;
   image?: string;
   specifications?: SpecGroup[] | string;
}

interface UpdateParams {
   action: 'update';
   _id: string;
   name?: string;
   category_id?: string;
   description?: string;
   price?: number;
   image?: string;
   specifications?: SpecGroup[] | string;
}

interface SetStatusParams {
   action: 'set-status';
   _id: string;
   status: boolean;
}

type AdminProductsEvent = ListParams | CreateParams | UpdateParams | SetStatusParams;

interface ProductDoc {
   _id: string;
   name: string;
   category_id: string | number;
   description?: string;
   price: number;
   image?: string;
   status: boolean;
   specifications?: SpecGroup[] | string;
   [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────

function isAuthorizationError(error: unknown): error is AuthorizationError {
   return error instanceof AuthorizationError;
}

// ── Actions ───────────────────────────────────────────

async function listProducts(params: ListParams) {
   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 100)));
   const page = Math.max(1, Math.floor(params.page ?? 1));

   const ref = db.collection('products');

   // No status filter — returns both on-shelf and off-shelf products
   const { data } = await ref
      .orderBy('_id', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

   const countRes = await ref.count();

   return { success: true, data: { products: data, total: countRes.total }, message: 'Success' };
}

async function createProduct(params: CreateParams) {
   const input: ProductInput = {
      name: params.name,
      category_id: params.category_id,
      description: params.description,
      price: params.price,
      image: params.image,
   };

   const validation = validateProductCreate(input);
   if (!validation.valid) {
      return { success: false, message: validation.message };
   }

   // Normalize specifications to object form
   const specs = normalizeSpecifications(params.specifications);

   const productData = {
      name: input.name!.trim(),
      category_id: input.category_id!,
      description: input.description ?? '',
      price: input.price!,
      image: input.image ?? '',
      status: true, // New products default to on-shelf
      specifications: specs ?? [],
   };

   const { _id } = await db.collection('products').add({ data: productData });

   return {
      success: true,
      data: { product: { _id, ...productData } },
      message: '商品创建成功',
   };
}

async function updateProduct(params: UpdateParams) {
   const validation = validateProductUpdate(params);
   if (!validation.valid) {
      return { success: false, message: validation.message };
   }

   // Fetch existing product
   const { data: existing } = await db.collection('products').doc(params._id).get();

   if (!existing) {
      return { success: false, message: '商品不存在' };
   }

   const storedProduct = existing as ProductDoc;

   // Build update payload with only provided fields
   const updateData: Record<string, unknown> = {};

   if (params.name !== undefined) updateData.name = params.name.trim();
   if (params.category_id !== undefined) updateData.category_id = params.category_id;
   if (params.description !== undefined) updateData.description = params.description;
   if (params.price !== undefined) updateData.price = params.price;
   if (params.image !== undefined) updateData.image = params.image;

   // Handle specification normalization and legacy field merging
   if (params.specifications !== undefined) {
      const editedSpecs = normalizeSpecifications(params.specifications);
      updateData.specifications =
         mergeSpecifications(storedProduct.specifications, editedSpecs) ?? [];
   }

   await db.collection('products').doc(params._id).update({ data: updateData });

   return { success: true, message: '商品更新成功' };
}

async function setProductStatus(params: SetStatusParams) {
   if (!params._id || typeof params._id !== 'string') {
      return { success: false, message: '商品ID不能为空' };
   }
   if (typeof params.status !== 'boolean') {
      return { success: false, message: '请提供有效的上架状态' };
   }

   const { data: existing } = await db.collection('products').doc(params._id).get();

   if (!existing) {
      return { success: false, message: '商品不存在' };
   }

   await db
      .collection('products')
      .doc(params._id)
      .update({ data: { status: params.status } });

   const statusText = params.status ? '上架' : '下架';
   return { success: true, message: `商品已${statusText}` };
}

// ── Main entry ────────────────────────────────────────

export async function main(
   event: AdminProductsEvent,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   try {
      // Every action requires admin authorization
      await authorizeAdmin((event as { adminOpenId?: string }).adminOpenId);
   } catch (error) {
      if (isAuthorizationError(error)) {
         return { success: false, message: error.message };
      }
      return { success: false, message: '管理员身份验证失败' };
   }

   try {
      switch (event.action) {
         case 'list':
            return await listProducts(event);

         case 'create':
            return await createProduct(event);

         case 'update':
            return await updateProduct(event);

         case 'set-status':
            return await setProductStatus(event);

         default:
            return { success: false, message: `未知操作: ${(event as { action: string }).action}` };
      }
   } catch (error) {
      console.error('admin-products error:', error);
      return { success: false, message: '操作失败，请稍后重试' };
   }
}
