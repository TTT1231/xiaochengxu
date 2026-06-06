import cloud from 'wx-server-sdk';
import { db } from '../utils/database';
import { authorizeAdmin, AuthorizationError } from '../utils/admin-auth';
import {
   mergeProductSpecs,
   normalizeEditableSpecs,
   validateProductCreate,
   validateProductUpdate,
   type EditableSpecGroup,
   type ProductInput,
} from '../utils/product-validation';

// ── Types ─────────────────────────────────────────────

interface ListParams {
   action: 'list';
   pageSize?: number;
   page?: number;
   storagePrefix?: string;
}

interface CreateParams {
   action: 'create';
   name: string;
   categoried_id: string;
   description?: string;
   price: number;
   image?: string;
   /** Editable groups sent under the canonical product field name. */
   specs?: EditableSpecGroup[] | string;
}

interface UpdateParams {
   action: 'update';
   _id: string;
   name?: string;
   categoried_id?: string;
   description?: string;
   price?: number;
   image?: string;
   specs?: EditableSpecGroup[] | string;
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
   categoried_id: string | number;
   /** Read-only compatibility for records created by the old admin contract. */
   category_id?: string | number;
   description?: string;
   price: number;
   image?: string;
   specs?: Record<string, unknown> | string;
   /** Read-only compatibility for records created before `specs` became canonical. */
   specifications?: unknown[] | string;
   [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────

function isAuthorizationError(error: unknown): error is AuthorizationError {
   return error instanceof AuthorizationError;
}

// ── Image resolution ──────────────────────────────────

function normalizeProductSpecsForResponse(products: Array<Record<string, unknown>>): void {
   for (const product of products) {
      if (
         product.categoried_id === undefined &&
         product.category_id !== undefined &&
         product.category_id !== 'undefined'
      ) {
         product.categoried_id = product.category_id;
      }
      delete product.category_id;
      delete product.specifications;
   }
}

async function resolveProductImages(
   products: Array<Record<string, unknown>>,
   storagePrefix?: string,
): Promise<void> {
   // Step 1: Normalize `images` → `image`, build cloud:// fileIDs
   for (const p of products) {
      if (!p.image && p.images) {
         p.image = String(p.images).split('&')[0];
      }
      if (!p.image || typeof p.image !== 'string') continue;
      if (p.image.startsWith('http')) continue;
      if (p.image.startsWith('cloud://')) continue;
      if (storagePrefix) {
         const dir = p.image.includes('/') ? '' : 'product-imgs/';
         p.image = storagePrefix + dir + p.image;
      }
   }

   // Step 2: Batch convert cloud:// fileIDs to HTTPS temp URLs
   const fileIDs = [
      ...new Set(
         products
            .map(p => p.image)
            .filter((img): img is string => typeof img === 'string' && img.startsWith('cloud://')),
      ),
   ];
   if (fileIDs.length === 0) return;

   try {
      const urlResult = await cloud.getTempFileURL({ fileList: fileIDs });
      const urlMap = new Map<string, string>();
      for (const entry of urlResult.fileList) {
         if (entry.status === 0 && entry.tempFileURL) {
            urlMap.set(entry.fileID, entry.tempFileURL);
         }
      }
      for (const p of products) {
         if (p.image && urlMap.has(p.image as string)) {
            p.image = urlMap.get(p.image as string)!;
         }
      }
   } catch (error) {
      console.error('resolveProductImages error:', error);
   }
}

// ── Actions ───────────────────────────────────────────

async function listProducts(params: ListParams) {
   const pageSize = Math.min(200, Math.max(1, Math.floor(params.pageSize ?? 100)));
   const page = Math.max(1, Math.floor(params.page ?? 1));

   const ref = db.collection('products');
   const { data } = await ref
      .orderBy('_id', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
   const countRes = await ref.count();

   const products = data as Array<Record<string, unknown>>;
   normalizeProductSpecsForResponse(products);
   await resolveProductImages(products, params.storagePrefix);

   return { success: true, data: { products, total: countRes.total }, message: 'Success' };
}

async function createProduct(params: CreateParams) {
   const input: ProductInput = {
      name: params.name,
      categoried_id: params.categoried_id,
      description: params.description,
      price: params.price,
      image: params.image,
      specs: params.specs,
   };

   const validation = validateProductCreate(input);
   if (!validation.valid) {
      return { success: false, message: validation.message };
   }

   const editedSpecs = normalizeEditableSpecs(params.specs);

   const productData: Record<string, unknown> = {
      name: input.name!.trim(),
      categoried_id: input.categoried_id!,
      description: input.description ?? '',
      price: input.price!,
      image: input.image ?? '',
      status: true,
      specs: JSON.stringify(mergeProductSpecs(undefined, editedSpecs)),
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

   const { data: existing } = await db.collection('products').doc(params._id).get();
   if (!existing) {
      return { success: false, message: '商品不存在' };
   }

   const storedProduct = existing as ProductDoc;

   const updateData: Record<string, unknown> = {};
   if (params.name !== undefined) updateData.name = params.name.trim();
   if (params.categoried_id !== undefined) updateData.categoried_id = params.categoried_id;
   if (params.description !== undefined) updateData.description = params.description;
   if (params.price !== undefined) updateData.price = params.price;
   if (params.image !== undefined) updateData.image = params.image;

   if (params.specs !== undefined) {
      const editedSpecs = normalizeEditableSpecs(params.specs);
      updateData.specs = JSON.stringify(mergeProductSpecs(storedProduct.specs, editedSpecs));
   }
   updateData.specifications = db.command.remove();
   updateData.category_id = db.command.remove();

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
