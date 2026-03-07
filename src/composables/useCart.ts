/**
 * 购物车逻辑 composable
 */

import { ref, computed } from 'vue';
import type { Product, CartItem } from '@/types';

// 全局购物车状态
const cartItems = ref<CartItem[]>([]);

export function useCart() {
   /**
    * 购物车商品列表
    */
   const items = computed(() => cartItems.value);

   /**
    * 购物车商品总数
    */
   const totalCount = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
   });

   /**
    * 购物车总金额
    */
   const totalAmount = computed(() => {
      return cartItems.value.reduce(
         (sum, item) => sum + item.product.price * item.quantity,
         0,
      );
   });

   /**
    * 添加商品到购物车
    */
   const addItem = (product: Product): void => {
      const existingItem = cartItems.value.find(
         item => item.product.id === product.id,
      );
      if (existingItem) {
         existingItem.quantity += 1;
      } else {
         cartItems.value.push({ product, quantity: 1 });
      }
   };

   /**
    * 减少购物车中的商品数量
    */
   const removeItem = (productId: string): void => {
      const existingItem = cartItems.value.find(
         item => item.product.id === productId,
      );
      if (existingItem) {
         if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
         } else {
            cartItems.value = cartItems.value.filter(
               item => item.product.id !== productId,
            );
         }
      }
   };

   /**
    * 获取商品在购物车中的数量
    */
   const getItemQuantity = (productId: string): number => {
      const item = cartItems.value.find(item => item.product.id === productId);
      return item ? item.quantity : 0;
   };

   /**
    * 清空购物车
    */
   const clearCart = (): void => {
      cartItems.value = [];
   };

   return {
      items,
      totalCount,
      totalAmount,
      addItem,
      removeItem,
      getItemQuantity,
      clearCart,
   };
}
