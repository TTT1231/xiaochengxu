/** 分类表 */
export interface Categoried {
   /** 文档 _id (自动生成) */
   _id: string;
   /** 分类名称 (唯一) */
   name: string;
   /** 图标 (微信云 fileID) */
   icon: string;
   /** 激活状态图标 (微信云 fileID) */
   active_icon: string;
   /** 排序顺序 (默认 0) */
   sort_order: number;
   /** 状态 (默认 true) */
   status: boolean;
}
