import cloud from 'wx-server-sdk';
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

interface DataApiEvent {
   action: 'categories' | 'products';
   storagePrefix?: string;
}

/** 数据查询 API — 替代客户端直连数据库（App 平台用 HTTP 调用） */
export async function main(
   event: DataApiEvent,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   const { action, storagePrefix } = event;

   try {
      if (action === 'categories') {
         const { data } = await db
            .collection('categoried')
            .where({ status: true })
            .orderBy('sort_order', 'asc')
            .limit(100)
            .get();

         return { success: true, data: { categories: data }, message: 'Success' };
      }

      if (action === 'products') {
         const { data } = await db
            .collection('products')
            .where({ status: true })
            .orderBy('_id', 'asc')
            .limit(100)
            .get();

         const products = data as Array<{
            image: string;
            specs?: unknown;
            specifications?: unknown;
            categoried_id?: string | number;
            category_id?: string | number;
         }>;

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

         // Step 1: 将所有类型的图片统一转为 cloud:// fileID
         for (const p of products) {
            if (!p.image) continue;
            // 已经是 HTTPS URL → 无需转换
            if (p.image.startsWith('http')) continue;
            // 已经是 cloud:// → 无需转换
            if (p.image.startsWith('cloud://')) continue;
            // 普通文件名（如 q1.png）→ 拼成完整 cloud:// fileID
            if (storagePrefix) {
               const dir = p.image.includes('/') ? '' : 'product-imgs/';
               p.image = storagePrefix + dir + p.image;
            }
         }

         // Step 2: 收集所有 cloud:// fileID，批量转为 HTTPS 临时 URL
         const fileIDs = [
            ...new Set(
               products
                  .map(p => p.image)
                  .filter((img): img is string => !!img && img.startsWith('cloud://')),
            ),
         ];

         if (fileIDs.length > 0) {
            const urlResult = await cloud.getTempFileURL({ fileList: fileIDs });
            const urlMap = new Map<string, string>();
            for (const item of urlResult.fileList) {
               if (item.status === 0 && item.tempFileURL) {
                  urlMap.set(item.fileID, item.tempFileURL);
               }
            }

            for (const p of products) {
               if (p.image && urlMap.has(p.image)) {
                  p.image = urlMap.get(p.image)!;
               }
            }
         }

         return { success: true, data: { products }, message: 'Success' };
      }

      return { success: false, message: `未知操作: ${action as string}` };
   } catch (error) {
      console.error('data-api error:', error);
      return { success: false, message: '数据查询失败' };
   }
}
