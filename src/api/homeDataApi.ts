import type { Categoried } from '../types/db-scheme/categoried';
import type { Products } from '../types';
import { resolveFileIDs, toProductFileID } from '@/utils/cloudStorage';
import { resolveCategoryIcon, resolveCategoryActiveIcon } from '@/data/imgPaths';

/** Client SDK single-request hard limit — use skip/limit loop to fetch all records */
const CLIENT_MAX_LIMIT = 20;

async function fetchAll<T>(collection: string, where: Record<string, unknown>): Promise<T[]> {
   const db = wx.cloud.database();
   const allData: T[] = [];
   let skip = 0;

   try {
      for (;;) {
         const { data } = await db
            .collection(collection)
            .where(where)
            .skip(skip)
            .limit(CLIENT_MAX_LIMIT)
            .get();
         allData.push(...(data as T[]));
         if (data.length < CLIENT_MAX_LIMIT) break;
         skip += CLIENT_MAX_LIMIT;
      }
   } catch (error) {
      console.error(`[fetchAll] 加载 ${collection} 失败:`, error);
   }

   return allData;
}

export async function getLeftMenuData(): Promise<Categoried[]> {
   const categories = await fetchAll<Categoried>('categoried', { status: true });

   return categories.map(c => ({
      ...c,
      icon: resolveCategoryIcon(c.icon, c.name),
      active_icon: resolveCategoryActiveIcon(c.active_icon, c.name),
   }));
}

export async function getRightProductData(): Promise<Products[]> {
   const rawProducts = await fetchAll<
      Products & { specifications?: unknown; category_id?: string | number }
   >('products', { status: true });
   const products = rawProducts.map(product => {
      const normalized = { ...product };
      if (
         normalized.categoried_id === undefined &&
         normalized.category_id !== undefined &&
         normalized.category_id !== 'undefined'
      ) {
         normalized.categoried_id = normalized.category_id;
      }
      delete normalized.category_id;
      delete normalized.specifications;
      return normalized;
   });

   const fileIDs = [
      ...new Set(
         products
            .map(p => p.image)
            .filter(Boolean)
            .map(toProductFileID)
            .filter(id => id.startsWith('cloud://')),
      ),
   ];

   if (fileIDs.length === 0) return products;

   const urlMap = await resolveFileIDs(fileIDs);

   return products.map(p => ({
      ...p,
      image: p.image ? urlMap.get(toProductFileID(p.image)) || toProductFileID(p.image) : '',
   }));
}
