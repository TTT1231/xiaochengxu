import type { Categoried } from '../types/db-scheme/categoried';
import type { Products } from '../types';
import { resolveFileIDs, toProductFileID, toIconFileID } from '@/utils/cloudStorage';

export async function getLeftMenuData(): Promise<Categoried[]> {
   const db = wx.cloud.database();
   const { data } = await db.collection('categoried').limit(100).get();
   const categories = (data as Categoried[]) || [];

   const fileIDs = [
      ...new Set(
         categories.flatMap(c =>
            [c.icon, c.active_icon]
               .map(id => (id ? toIconFileID(id) : ''))
               .filter(id => id.startsWith('cloud://')),
         ),
      ),
   ];

   if (fileIDs.length === 0) return categories;

   const urlMap = await resolveFileIDs(fileIDs);

   return categories.map(c => ({
      ...c,
      icon: c.icon ? urlMap.get(toIconFileID(c.icon)) || c.icon : c.icon,
      active_icon: c.active_icon ? urlMap.get(toIconFileID(c.active_icon)) || c.active_icon : c.active_icon,
   }));
}

export async function getRightProductData(): Promise<Products[]> {
   const db = wx.cloud.database();
   const { data } = await db.collection('products').limit(100).get();
   const products = (data as Products[]) || [];

   const fileIDs = [
      ...new Set(
         products.flatMap(p =>
            (p.images ? p.images.split('&') : [])
               .map(toProductFileID)
               .filter(id => id.startsWith('cloud://')),
         ),
      ),
   ];

   if (fileIDs.length === 0) return products;

   const urlMap = await resolveFileIDs(fileIDs);

   return products.map(p => ({
      ...p,
      images: p.images
         ? p.images
              .split('&')
              .map(name => urlMap.get(toProductFileID(name)) || name)
              .join('&')
         : '',
   }));
}
