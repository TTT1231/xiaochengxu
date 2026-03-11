import { defineStore } from 'pinia';
import type { Product, Category } from '@/types';
import type { Categoried } from '@/types/db-scheme/categoried';
import type { Products } from '@/types';
import { getLeftMenuData, getRightProductData } from '@/api/homeDataApi';

/** 将 DB 分类记录映射为前端 Category */
function mapCategory(raw: Categoried): Category {
   return {
      id: String(raw._id),
      name: raw.name,
      icon: raw.icon,
      activeIcon: raw.active_icon,
   };
}

/** 将 DB 产品记录映射为前端 Product */
function mapProduct(raw: Products): Product {
   // images 字段格式: "url1&url2&url3"，取第一张作为主图
   const firstImage = raw.images ? raw.images.split('&')[0] : '';
   return {
      id: raw._id,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      image: firstImage,
      categoryId: String(raw.categoried_id),
   };
}

interface HomeState {
   categories: Category[];
   products: Product[];
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
         const map = new Map<string, Product[]>();
         for (const product of state.products) {
            const list = map.get(product.categoryId) ?? [];
            map.set(product.categoryId, [...list, product]);
         }
         return map;
      },

      /** 获取指定分类的产品列表（返回函数支持传参） */
      getProductsByCategory:
         state =>
         (categoryId: string): Product[] =>
            state.products.filter(p => p.categoryId === categoryId),

      /** 根据ID获取产品（返回函数支持传参） */
      getProductById:
         state =>
         (productId: string): Product | undefined =>
            state.products.find(p => p.id === productId),
   },

   actions: {
      /** 获取首页数据（分类 + 产品） */
      async fetchData(): Promise<void> {
         if (this.categories.length > 0) return; // 已加载，跳过
         this.loading = true;
         this.error = null;
         try {
            const [catRes, prodData] = await Promise.all([
               getLeftMenuData(),
               getRightProductData(),
            ]);
            if (catRes.error) throw catRes.error;
            this.categories = (catRes.data ?? []).map(mapCategory);
            this.products = (prodData ?? []).map(mapProduct);
         } catch (err) {
            this.error = err instanceof Error ? err.message : '数据加载失败';
         } finally {
            this.loading = false;
         }
      },
   },
});
