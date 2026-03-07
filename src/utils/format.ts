/**
 * 格式化工具函数
 */

/**
 * 格式化价格（分转元，保留两位小数）
 */
export const formatPrice = (price: number): string => {
   return price.toFixed(2);
};

/**
 * 格式化价格为显示字符串
 */
export const formatPriceDisplay = (price: number): string => {
   return `¥${formatPrice(price)}`;
};

/**
 * 格式化积分显示
 */
export const formatPoints = (points: number): string => {
   if (points >= 10000) {
      return `${(points / 10000).toFixed(1)}万`;
   }
   return points.toString();
};

/**
 * 格式化订单号（隐藏部分）
 */
export const formatOrderNo = (orderNo: string): string => {
   if (orderNo.length <= 8) return orderNo;
   return `${orderNo.slice(0, 4)}****${orderNo.slice(-4)}`;
};

/**
 * 格式化日期时间
 */
export const formatDateTime = (dateStr: string): string => {
   const date = new Date(dateStr);
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   return `${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化相对时间（几分钟前、几小时前等）
 */
export const formatRelativeTime = (dateStr: string): string => {
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
};
