import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

export const useHomeStore = defineStore('home', () => {
   const categories = ref<Category[]>([]);
   const products = ref<Product[]>([]);
   const loading = ref(false);
   const error = ref<string | null>(null);

   const productsByCategory = computed(() => {
      const map = new Map<string, Product[]>();
      for (const product of products.value) {
         const list = map.get(product.categoryId) ?? [];
         map.set(product.categoryId, [...list, product]);
      }
      return map;
   });

   const getProductsByCategory = (categoryId: string): Product[] =>
      productsByCategory.value.get(categoryId) ?? [];

   const getProductById = (productId: string): Product | undefined =>
      products.value.find(p => p.id === productId);

   const fetchData = async (): Promise<void> => {
      if (categories.value.length > 0) return; // 已加载，跳过
      loading.value = true;
      error.value = null;
      try {
         const [catRes, prodData] = await Promise.all([getLeftMenuData(), getRightProductData()]);
         if (catRes.error) throw catRes.error;
         categories.value = (catRes.data ?? []).map(mapCategory);
         products.value = (prodData ?? []).map(mapProduct);
      } catch (err) {
         error.value = err instanceof Error ? err.message : '数据加载失败';
      } finally {
         loading.value = false;
      }
   };

   return {
      categories,
      products,
      loading,
      error,
      productsByCategory,
      getProductsByCategory,
      getProductById,
      fetchData,
   };
});
