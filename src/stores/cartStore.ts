import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, CartItem } from '@/types';

export const useCartStore = defineStore('cart', () => {
   const cartItems = ref<CartItem[]>([]);

   const items = computed(() => cartItems.value);

   const totalCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));

   const totalAmount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
   );

   const addItem = (product: Product): void => {
      const index = cartItems.value.findIndex(item => item.product.id === product.id);
      if (index > -1) {
         // 直接修改现有项的数量，避免创建新数组
         cartItems.value[index].quantity += 1;
      } else {
         cartItems.value.push({ product, quantity: 1 });
      }
   };

   const removeItem = (productId: string): void => {
      const index = cartItems.value.findIndex(item => item.product.id === productId);
      if (index === -1) return;
      if (cartItems.value[index].quantity > 1) {
         // 直接修改数量，避免创建新数组
         cartItems.value[index].quantity -= 1;
      } else {
         // 只有一项时才移除
         cartItems.value.splice(index, 1);
      }
   };

   const getItemQuantity = (productId: string): number => {
      return cartItems.value.find(item => item.product.id === productId)?.quantity ?? 0;
   };

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
});
