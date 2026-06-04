import { defineStore } from 'pinia';
import type { Products, Categoried } from '@/types';
import { getLeftMenuData, getRightProductData } from '@/api/homeDataApi';
import { useUserStore } from './userStore';

const CLOUD_TIMEOUT_MS = 10_000;

function waitForCloud(): Promise<void> {
   const userStore = useUserStore();
   if (userStore.cloudReady) return Promise.resolve();
   return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
         if (userStore.cloudReady) {
            clearInterval(timer);
            resolve();
         }
      }, 50);
      setTimeout(() => {
         clearInterval(timer);
         reject(new Error('云环境初始化超时'));
      }, CLOUD_TIMEOUT_MS);
   });
}

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
      getProductsByCategory:
         state =>
         (categoryId: string): Products[] =>
            state.products.filter(p => String(p.categoried_id) === String(categoryId)),

      getProductById:
         state =>
         (productId: string): Products | undefined =>
            state.products.find(p => p._id === productId),
   },

   actions: {
      async fetchData(forceRefresh = false): Promise<void> {
         if (!forceRefresh && this.categories.length > 0) return;
         this.loading = true;
         this.error = null;
         try {
            await waitForCloud();
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
