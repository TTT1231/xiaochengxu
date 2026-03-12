import { useEnvConfig } from '../hooks/useEnvConfig';
import type { Categoried } from '../types/db-scheme/categoried';
import type { Products } from '../types';
import { supabaseClient } from '../utils/supabaseClient';

const envConfig = useEnvConfig();

/**
 * 获取首页左侧分类菜单
 * @returns 分类列表
 * @throws {Error} 数据库查询失败时抛出
 */
export async function getLeftMenuData(): Promise<Categoried[]> {
   const { data, error } = await supabaseClient.query<Categoried>('categoried');
   if (error) throw error;
   return data;
}

/**
 * 获取首页右侧产品数据
 * @returns 产品列表（图片路径已转换为完整URL）
 * @throws {Error} 数据库查询失败时抛出
 */
export async function getRightProductData(): Promise<Products[]> {
   const { data, error } = await supabaseClient.query<Products>('products');

   if (error) throw error;

   const storagePrefix = `${envConfig.supabaseUrl}/storage/v1/object/public/products-img/`;

   /**
    * 将images 的数据 xx1.png&xx1_des_1.png&xx1_des_2.png 加上前缀
    * 支持两种格式：完整 URL 或相对路径
    * 使用 map 创建新数组，避免直接变异原数据
    */
   return data.map(product => {
      const imageList = product.images.split('&');
      const fullImageList = imageList.map(image =>
         image.startsWith('http') ? image : `${storagePrefix}${image}`,
      );
      return { ...product, images: fullImageList.join('&') };
   });
}
