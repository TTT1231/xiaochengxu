/**
 * 分类表 / Categories table
 */
export interface Categoried {
   /** 主键 ID (自增 bigint) / Primary key ID (auto-increment bigint) */
   _id: number;
   /** 分类名称 (唯一) / Category name (unique) */
   name: string;
   /** 图标路径 (唯一) / Icon path (unique) */
   icon: string;
   /** 激活状态图标路径 (唯一) / Active state icon path (unique) */
   active_icon: string;
   /** 排序顺序 (默认 0) / Sort order (default 0) */
   sort_order: number;
   /** 状态 (默认 true) / Status (default true) */
   status: boolean;
}
