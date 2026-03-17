import { useEnvConfig } from '../hooks/useEnvConfig';
import type { Categoried } from '../types/db-scheme/categoried';
import type { Products } from '../types';
import { supabaseClient } from '../utils/supabaseClient';

const envConfig = useEnvConfig();

export async function getLeftMenuData(): Promise<Categoried[]> {
   const { data, error } = await supabaseClient.query<Categoried>('categoried');
   if (error) throw error;
   return data;
}

export async function getRightProductData(): Promise<Products[]> {
   const { data, error } = await supabaseClient.query<Products>('products');

   if (error) throw error;

   const storagePrefix = `${envConfig.supabaseUrl}/storage/v1/object/public/products-img/`;

   return data.map(product => {
      const imageList = product.images.split('&');
      const fullImageList = imageList.map(image =>
         image.startsWith('http') ? image : `${storagePrefix}${image}`,
      );
      return { ...product, images: fullImageList.join('&') };
   });
}
