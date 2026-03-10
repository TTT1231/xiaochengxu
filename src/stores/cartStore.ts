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
      const existing = cartItems.value.find(item => item.product.id === product.id);
      if (existing) {
         cartItems.value = cartItems.value.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
         );
      } else {
         cartItems.value = [...cartItems.value, { product, quantity: 1 }];
      }
   };

   const removeItem = (productId: string): void => {
      const existing = cartItems.value.find(item => item.product.id === productId);
      if (!existing) return;
      if (existing.quantity > 1) {
         cartItems.value = cartItems.value.map(item =>
            item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
         );
      } else {
         cartItems.value = cartItems.value.filter(item => item.product.id !== productId);
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
