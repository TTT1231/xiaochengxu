import type { Products } from '../types';
import type { Categoried } from '../types/db-scheme/categoried';
import { supabaseClient } from '../utils/supabaseClient';

//首页左侧菜单数据
export async function getLeftMenuData() {
   return supabaseClient.query<Categoried>('categoried');
}

//首页右侧产品数据
export async function getRightProductData() {
   const { data, error } = await supabaseClient.query<Products>('products');

   if (error) throw error;

   const storagePrefix = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products-img/`;

   /**
    * 将images 的数据 xx1.png&xx1_des_1.png&xx1_des_2.png 加上前缀
    * 支持两种格式：完整 URL 或相对路径
    */
   data.forEach(product => {
      const imageList = product.images.split('&');
      const fullImageList = imageList.map(image =>
         image.startsWith('http') ? image : `${storagePrefix}${image}`,
      );
      product.images = fullImageList.join('&');
   });

   return data;
}
