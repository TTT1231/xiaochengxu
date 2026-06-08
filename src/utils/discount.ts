/** VIP 专享折扣品类 ID（饮料咖啡） */
const VIP_DISCOUNT_CATEGORY_ID = '2';

/** VIP 折扣率（8.8折 = 优惠 12%） */
const VIP_DISCOUNT_RATE = 0.12;

/**
 * 计算单品折扣金额
 * - 只有 VIP 会员 + 饮料咖啡品类（categoried_id=2）才享受折扣
 * - 折扣 = price * 0.12（即打 8.8 折）
 */
export function getItemDiscount(
   price: number,
   categoryId: string | number,
   isVip: boolean,
): number {
   if (!isVip) return 0;
   if (String(categoryId) !== VIP_DISCOUNT_CATEGORY_ID) return 0;
   return Math.round(price * VIP_DISCOUNT_RATE * 100) / 100;
}
