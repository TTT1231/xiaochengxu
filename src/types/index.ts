/**
 * 类型定义统一导出
 */

export type { OrderStatus } from './order';
export { ORDER_STATUS_TEXT } from './order';

export type { User, Reward } from './user';

/**
 * 数据库 schema 统一导出
 */

export type {
   Categoried,
   OrderDetailItem,
   Orders,
   ProductSpecOption,
   ProductSpecGroup,
   ProductSpecs,
   Products,
} from './db-scheme';
