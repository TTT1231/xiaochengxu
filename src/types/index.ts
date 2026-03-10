/**
 * 类型定义统一导出
 */

export type { Product, Category, CartItem } from './product';

export type { OrderStatus, OrderItem, Order } from './order';

export type { User, Reward } from './user';

/**
 * 数据库scheme统一导出
 */

export type {
   Categoried,
   ProductSpecOption,
   ProductSpecGroup,
   ProductSpecs,
   Products,
} from './db-scheme';
