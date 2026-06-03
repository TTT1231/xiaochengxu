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
   /** 文档 _id = 原始数字 ID (字符串形式) */
   _id: string;
   /** 分类 ID (对应 Categoried._id，历史数据可能为数字) */
   categoried_id: string | number;
   /** 产品名称 */
   name: string;
   /** 产品描述 */
   description: string;
   /** 价格 (单位: 元) */
   price: number;
   /** 产品图片 (微信云 fileID) */
   image: string;
   /** 产品规格 (JSON，云数据库迁移数据可能为字符串) */
   specs: ProductSpecs | string;
   /** 优惠金额 (单位: 元)，0 表示无优惠 */
   discount: number;
   /** 状态 (上架/下架) */
   status: boolean;
}
