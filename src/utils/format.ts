/** 默认占位图 */
export const PLACEHOLDER_IMAGE = '/static/images/placeholder.png';

/**
 * 解析产品图片字符串，获取主图（第一张）
 * @param images 图片字符串，多张图片用 & 分隔
 * @param fallback 默认图片路径
 */
export function getMainImage(images: string | undefined, fallback = PLACEHOLDER_IMAGE): string {
   if (!images) return fallback;
   return images.split('&')[0] || fallback;
}

/**
 * 解析产品图片字符串，返回所有图片数组
 * @param images 图片字符串，多张图片用 & 分隔
 */
export function parseImages(images: string | undefined): string[] {
   if (!images) return [];
   return images.split('&').filter(Boolean);
}

/**
 * 格式化数字（添加千分位）
 * @param num 数字
 */
export function formatNumber(num: number): string {
   return num.toLocaleString();
}

/**
 * 格式化价格（分转元，保留两位小数）
 */
export function formatPrice(price: number): string {
   return price % 1 === 0 ? price.toString() : price.toFixed(2);
}

/**
 * 格式化价格为显示字符串
 */
export function formatPriceDisplay(price: number): string {
   return `¥${formatPrice(price)}`;
}

/**
 * 格式化积分显示
 */
export function formatPoints(points: number): string {
   if (points >= 10000) {
      return `${(points / 10000).toFixed(1)}万`;
   }
   return points.toString();
}

/**
 * 格式化订单号（隐藏部分）
 */
export function formatOrderNo(orderNo: string): string {
   if (orderNo.length <= 8) return orderNo;
   return `${orderNo.slice(0, 4)}****${orderNo.slice(-4)}`;
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string): string {
   const date = new Date(dateStr);
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化相对时间（几分钟前、几小时前等）
 */
export function formatRelativeTime(dateStr: string): string {
   const date = new Date(dateStr);
   const now = new Date();
   const diffMs = now.getTime() - date.getTime();
   const diffMinutes = Math.floor(diffMs / (1000 * 60));
   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

   if (diffMinutes < 1) return '刚刚';
   if (diffMinutes < 60) return `${diffMinutes}分钟前`;
   if (diffHours < 24) return `${diffHours}小时前`;
   if (diffDays < 7) return `${diffDays}天前`;
   return formatDateTime(dateStr);
}
