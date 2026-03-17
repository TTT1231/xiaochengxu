/** 产品规格选项 */
export interface ProductSpecOption {
   /** 选项值 (如: 标准甜、半糖) */
   value: string;
   /** 是否售罄 */
   isSoldOut: boolean;
}

/** 产品规格组 */
export interface ProductSpecGroup {
   /** 规格组名称 (如: 甜度、包装) */
   name: string;
   /** 是否必选 */
   required: boolean;
   /** 规格选项列表 */
   options: ProductSpecOption[];
}

/** 产品规格 (JSON 字段)，键为规格标识 (如: sweetness, packaging) */
export type ProductSpecs = Record<string, ProductSpecGroup>;

/** 产品表 */
export interface Products {
   /** 主键 ID (UUID) */
   _id: string;
   /** 分类 ID (外键关联 categoried 表) */
   categoried_id: number;
   /** 产品名称 */
   name: string;
   /** 产品描述 */
   description: string;
   /** 价格 (单位: 分) */
   price: number;
   /** 产品图片 (逗号分隔或 JSON 数组) */
   images: string;
   /** 产品规格 (JSON) */
   specs: ProductSpecs;
   /** 优惠金额 (单位: 元)，0 表示无优惠 */
   discount: number;
   /** 状态 (上架/下架) */
   status: boolean;
}
