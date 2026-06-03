export const PLACEHOLDER_IMAGE = '/static/images/placeholder.png';

/** 获取产品图片，无图时返回占位图 */
export function getProductImage(image: string | undefined, fallback = PLACEHOLDER_IMAGE): string {
   if (!image) return fallback;
   return image;
}

/** 添加千分位分隔符 */
export function formatNumber(num: number): string {
   return num.toLocaleString();
}

/** 格式化价格，整数不带小数，非整数保留两位 */
export function formatPrice(price: number): string {
   return price % 1 === 0 ? price.toString() : price.toFixed(2);
}

/** 格式化价格显示（带人民币符号） */
export function formatPriceDisplay(price: number): string {
   return `¥${formatPrice(price)}`;
}

/** 格式化余额，超过 1 万以"万"为单位 */
export function formatBalance(balance: number): string {
   if (balance >= 10000) {
      return `${(balance / 10000).toFixed(1)}万`;
   }
   return balance % 1 === 0 ? balance.toString() : balance.toFixed(2);
}

/** 隐藏订单号中间部分 */
export function formatOrderNo(orderNo: string): string {
   if (orderNo.length <= 8) return orderNo;
   return `${orderNo.slice(0, 4)}****${orderNo.slice(-4)}`;
}

/** 格式化为 YYYY-MM-DD HH:mm */
export function formatDateTime(dateStr: string): string {
   const date = new Date(dateStr);
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/** 相对时间（刚刚 / N分钟前 / N小时前 / N天前） */
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
