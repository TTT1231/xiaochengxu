import type { Orders } from '@/types';

export function calcOrderActualAmount(
   order: Pick<Orders, 'total_amount' | 'discount_amount' | 'wallet_deduct' | 'delivery_fee'>,
): number {
   return Math.max(
      order.total_amount +
         (order.delivery_fee ?? 0) -
         (order.discount_amount ?? 0) -
         (order.wallet_deduct ?? 0),
      0,
   );
}
