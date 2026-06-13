import type { DeliveryType, OrderStatus } from '../constants';

/** 订单商品详情 (order_details JSON 中每个商品项) */
export interface OrderDetailItem {
   /** 商品 ID */
   product_id: string;
   /** 商品名称 */
   product_name: string;
   /** 商品图片 (微信云 fileID) */
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
   /** 文档 _id = order_id (原子唯一性) */
   _id: string;
   /** 订单号 */
   order_id: string;
   /** 用户 ID (openid) */
   user_id: string;
   /** 订单状态 */
   order_status: OrderStatus;
   /** 总金额（元）- 折前金额 */
   total_amount: number;
   /** 优惠金额（元） */
   discount_amount: number;
   /** 创建时间 */
   created_at: string;
   /** 钱包扣款金额（元） */
   wallet_deduct: number;
   /** 配送类型 */
   delivery_type: DeliveryType;
   /** 配送费（元） */
   delivery_fee: number;
   /** 订单备注 */
   remark?: string;
   /** 配送地址 */
   delivery_address?: string;
   /** 配送联系电话 */
   delivery_phone?: string;
   /** 期望到店/到货时间 HH:MM（用户下单时选择的预约时间） */
   expected_time?: string;
   /** 订单商品详情 */
   order_details: OrderDetailItem[];
}
