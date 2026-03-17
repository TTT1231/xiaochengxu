/**
 * 产品表定义 / Product table definitions
 */

/**
 * 产品规格选项 / Product specification option
 */
export interface ProductSpecOption {
   /** 选项值 (如: 标准甜、半糖) / Option value */
   value: string;
   /** 是否售罄 / Is sold out */
   isSoldOut: boolean;
}

/**
 * 产品规格组 / Product specification group
 */
export interface ProductSpecGroup {
   /** 规格组名称 (如: 甜度、包装) / Spec group name (e.g., Sweetness, Packaging) */
   name: string;
   /** 是否必选 / Is required */
   required: boolean;
   /** 规格选项列表 / Spec options */
   options: ProductSpecOption[];
}

/**
 * 产品规格 / Product specifications (JSON field)
 * 键为规格标识 (如: sweetness, packaging)
 */
export type ProductSpecs = Record<string, ProductSpecGroup>;

/**
 * 产品表 / Products table
 */
export interface Products {
   /** 主键 ID (UUID) / Primary key ID */
   _id: string;
   /** 分类 ID (外键关联 categoried 表) / Category ID (FK to categoried) */
   categoried_id: number;
   /** 产品名称 / Product name */
   name: string;
   /** 产品描述 / Product description */
   description: string;
   /** 价格 (单位: 分) / Price in cents */
   price: number;
   /** 产品图片 (逗号分隔或 JSON 数组) / Product images (comma-separated or JSON array) */
   images: string;
   /** 产品规格 (JSON) / Product specifications */
   specs: ProductSpecs;
   /** 优惠金额 (单位: 元) / Discount amount in yuan, 0 = no discount */
   discount: number;
   /** 状态 (上架/下架) / Status (enabled/disabled) */
   status: boolean;
}
