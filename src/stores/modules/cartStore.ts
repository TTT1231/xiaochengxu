import { defineStore } from 'pinia';
import type { Products } from '@/types';

/** 购物车商品项 */
export interface CartItem {
   product: Products;
   quantity: number;
   /** 用户选择的规格 { "甜度": "标准甜", "包装": "环保纸袋" } */
   selectedSpecs: Record<string, string>;
}

interface CartState {
   items: CartItem[];
}

function normalizeSpecs(specs: Record<string, string> = {}): string {
   return Object.keys(specs)
      .sort()
      .map(key => `${key}:${specs[key]}`)
      .join('|');
}

function isSameCartLine(
   item: CartItem,
   productId: string,
   selectedSpecs?: Record<string, string>,
): boolean {
   return (
      item.product._id === productId &&
      normalizeSpecs(item.selectedSpecs) === normalizeSpecs(selectedSpecs)
   );
}

export const useCartStore = defineStore('cart', {
   state: (): CartState => ({
      items: [],
   }),

   getters: {
      totalCount: state => state.items.reduce((sum, item) => sum + item.quantity, 0),

      /** 折后价合计 */
      totalAmount: state =>
         state.items.reduce(
            (sum, item) => sum + (item.product.price - item.product.discount) * item.quantity,
            0,
         ),

      totalDiscount: state =>
         state.items.reduce((sum, item) => sum + item.product.discount * item.quantity, 0),

      originalAmount: state =>
         state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      getItemQuantity:
         state =>
         (productId: string): number =>
            state.items
               .filter(item => item.product._id === productId)
               .reduce((sum, item) => sum + item.quantity, 0),
   },

   actions: {
      addItem(product: Products, selectedSpecs?: Record<string, string>): void {
         const specs = selectedSpecs ?? {};
         const index = this.items.findIndex(item => isSameCartLine(item, product._id, specs));
         if (index > -1) {
            this.items[index] = {
               ...this.items[index],
               quantity: this.items[index].quantity + 1,
               selectedSpecs: specs,
            };
         } else {
            this.items.push({ product, quantity: 1, selectedSpecs: specs });
         }
      },

      removeItem(productId: string, selectedSpecs?: Record<string, string>): void {
         const index = this.items.findIndex(item =>
            selectedSpecs
               ? isSameCartLine(item, productId, selectedSpecs)
               : item.product._id === productId,
         );
         if (index === -1) return;
         if (this.items[index].quantity > 1) {
            this.items[index] = {
               ...this.items[index],
               quantity: this.items[index].quantity - 1,
            };
         } else {
            this.items.splice(index, 1);
         }
      },

      clearCart(): void {
         this.items = [];
      },
   },
});
