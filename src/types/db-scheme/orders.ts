/** 订单商品详情 (order_details JSON 中每个商品项) */
export interface OrderDetailItem {
   /** 商品 ID */
   product_id: string;
   /** 商品名称 */
   product_name: string;
   /** 商品图片 */
   product_image: string;
   /** 用户选择的规格 { "甜度": "标准甜", "包装": "精美礼盒" } */
   specs: Record<string, string>;
   /** 含规格加价的单价（元） */
   price: number;
   /** 单品优惠金额（元） */
   discount: number;
   /** 数量 */
   quantity: number;
}

/** 订单表 */
export interface Orders {
   /** 主键 ID */
   _id: string;
   /** 订单号 */
   order_id: string;
   /** 用户 ID (openid) */
   user_id: string;
   /** 订单状态 */
   order_status: string;
   /** 总金额（分） */
   total_amount: number;
   /** 优惠金额（分） */
   discount_amount: number;
   /** 创建时间 */
   created_at: string;
   /** 订单商品详情 */
   oder_details: OrderDetailItem[];
}
