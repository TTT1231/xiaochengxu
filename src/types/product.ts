/**
 * 商品相关类型定义
 */

export interface Product {
   id: string;
   name: string;
   description: string;
   price: number;
   image: string;
   categoryId: string;
}

export interface Category {
   id: string;
   name: string;
   icon: string;
   activeIcon?: string; // 选中状态的图标
}

export interface CartItem {
   product: Product;
   quantity: number;
}
