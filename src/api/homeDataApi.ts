import type { Categoried } from '../types/db-scheme/categoried';
import type { Products } from '../types';
import { resolveFileIDs, toProductFileID } from '@/utils/cloudStorage';
import { resolveCategoryIcon, resolveCategoryActiveIcon } from '@/data/imgPaths';

export async function getLeftMenuData(): Promise<Categoried[]> {
   const db = wx.cloud.database();
   const { data } = await db.collection('categoried').where({ status: true }).limit(100).get();
   const categories = (data as unknown as Categoried[]) || [];

   return categories.map(c => ({
      ...c,
      icon: resolveCategoryIcon(c.icon),
      active_icon: resolveCategoryActiveIcon(c.active_icon),
   }));
}

export async function getRightProductData(): Promise<Products[]> {
   const db = wx.cloud.database();
   const { data } = await db.collection('products').where({ status: true }).limit(100).get();
   const products = (data as unknown as Products[]) || [];

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
