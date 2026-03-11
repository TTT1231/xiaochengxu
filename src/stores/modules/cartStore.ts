import { defineStore } from 'pinia';
import type { Product, CartItem } from '@/types';

interface CartState {
   items: CartItem[];
}

export const useCartStore = defineStore('cart', {
   state: (): CartState => ({
      items: [],
   }),

   getters: {
      /** 购物车商品总数 */
      totalCount: state => state.items.reduce((sum, item) => sum + item.quantity, 0),

      /** 购物车总金额 */
      totalAmount: state =>
         state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      /** 获取指定商品数量（返回函数支持传参） */
      getItemQuantity:
         state =>
         (productId: string): number => {
            return state.items.find(item => item.product.id === productId)?.quantity ?? 0;
         },
   },

   actions: {
      /** 添加商品到购物车 */
      addItem(product: Product): void {
         const index = this.items.findIndex(item => item.product.id === product.id);
         if (index > -1) {
            this.items[index].quantity += 1;
         } else {
            this.items.push({ product, quantity: 1 });
         }
      },

      /** 从购物车移除商品（数量-1） */
      removeItem(productId: string): void {
         const index = this.items.findIndex(item => item.product.id === productId);
         if (index === -1) return;
         if (this.items[index].quantity > 1) {
            this.items[index].quantity -= 1;
         } else {
            this.items.splice(index, 1);
         }
      },

      /** 清空购物车 */
      clearCart(): void {
         this.items = [];
      },
   },
});
