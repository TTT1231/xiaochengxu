import { defineStore } from 'pinia';
import type { Products, Categoried } from '@/types';
import { getLeftMenuData, getRightProductData } from '@/api/homeDataApi';

interface HomeState {
   categories: Categoried[];
   products: Products[];
   loading: boolean;
   error: string | null;
}

export const useHomeStore = defineStore('home', {
   state: (): HomeState => ({
      categories: [],
      products: [],
      loading: false,
      error: null,
   }),

   getters: {
      /** 按分类ID分组的产品Map */
      productsByCategory: state => {
         const map = new Map<number, Products[]>();
         for (const product of state.products) {
            const list = map.get(product.categoried_id) ?? [];
            map.set(product.categoried_id, [...list, product]);
         }
         return map;
      },

      /** 获取指定分类的产品列表（返回函数支持传参） */
      getProductsByCategory:
         state =>
         (categoryId: number): Products[] =>
            state.products.filter(p => p.categoried_id === categoryId),

      /** 根据ID获取产品（返回函数支持传参） */
      getProductById:
         state =>
         (productId: string): Products | undefined =>
            state.products.find(p => p._id === productId),
   },

   actions: {
      /** 获取首页数据（分类 + 产品） */
      async fetchData(): Promise<void> {
         if (this.categories.length > 0) return; // 已加载，跳过
         this.loading = true;
         this.error = null;
         try {
            const [categories, products] = await Promise.all([
               getLeftMenuData(),
               getRightProductData(),
            ]);
            this.categories = categories;
            this.products = products;
         } catch (err) {
            this.error = err instanceof Error ? err.message : '数据加载失败';
         } finally {
            this.loading = false;
         }
      },
   },
});
