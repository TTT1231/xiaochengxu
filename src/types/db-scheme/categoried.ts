/** 分类表 */
export interface Categoried {
   /** 主键 ID (自增 bigint) */
   _id: number;
   /** 分类名称 (唯一) */
   name: string;
   /** 图标路径 (唯一) */
   icon: string;
   /** 激活状态图标路径 (唯一) */
   active_icon: string;
   /** 排序顺序 (默认 0) */
   sort_order: number;
   /** 状态 (默认 true) */
   status: boolean;
}
