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

export const useCartStore = defineStore('cart', {
   state: (): CartState => ({
      items: [],
   }),

   getters: {
      /** 购物车商品总数 */
      totalCount: state => state.items.reduce((sum, item) => sum + item.quantity, 0),

      /** 购物车总金额（折后价） */
      totalAmount: state =>
         state.items.reduce(
            (sum, item) => sum + (item.product.price - item.product.discount) * item.quantity,
            0,
         ),

      /** 购物车总优惠 */
      totalDiscount: state =>
         state.items.reduce((sum, item) => sum + item.product.discount * item.quantity, 0),

      /** 购物车原价总和 */
      originalAmount: state =>
         state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      /** 获取指定商品数量（返回函数支持传参） */
      getItemQuantity:
         state =>
         (productId: string): number => {
            return state.items.find(item => item.product._id === productId)?.quantity ?? 0;
         },
   },

   actions: {
      /** 添加商品到购物车 */
      addItem(product: Products, selectedSpecs?: Record<string, string>): void {
         const index = this.items.findIndex(item => item.product._id === product._id);
         if (index > -1) {
            this.items[index] = {
               ...this.items[index],
               quantity: this.items[index].quantity + 1,
               selectedSpecs: selectedSpecs ?? this.items[index].selectedSpecs,
            };
         } else {
            this.items.push({ product, quantity: 1, selectedSpecs: selectedSpecs ?? {} });
         }
      },

      /** 从购物车移除商品（数量-1） */
      removeItem(productId: string): void {
         const index = this.items.findIndex(item => item.product._id === productId);
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

      /** 清空购物车 */
      clearCart(): void {
         this.items = [];
      },
   },
});
