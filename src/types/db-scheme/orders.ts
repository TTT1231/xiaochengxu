/**
 * 订单表定义 / Orders table definitions
 */

/**
 * oder_details JSON 中每个商品项的结构
 */
export interface OrderDetailItem {
   /** 商品 ID / Product ID */
   product_id: string;
   /** 商品名称 / Product name */
   product_name: string;
   /** 商品图片 / Product image */
   product_image: string;
   /** 用户选择的规格 { "甜度": "标准甜", "包装": "精美礼盒" } */
   specs: Record<string, string>;
   /** 含规格加价的单价（分） / Unit price including spec surcharges (in cents) */
   price: number;
   /** 数量 / Quantity */
   quantity: number;
}

/**
 * orders 表对应类型 / Orders table type
 */
export interface Orders {
   /** 主键 ID / Primary key ID */
   _id: string;
   /** 订单号 / Order number */
   order_id: string;
   /** 用户 ID (openid) / User ID */
   user_id: string;
   /** 订单状态 / Order status */
   order_status: string;
   /** 总金额（分） / Total amount (in cents) */
   total_amount: number;
   /** 优惠金额（分） / Discount amount (in cents) */
   discount_amount: number;
   /** 创建时间 / Created at */
   created_at: string;
   /** 订单商品详情 / Order detail items */
   oder_details: OrderDetailItem[];
}
