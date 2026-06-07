export interface DeliveryConfigResult {
   free_threshold: number;
   delivery_fee: number;
}

/**
 * 获取配送费配置
 * @returns 配送费配置（获取失败时返回默认值，保证核心流程可用）
 */
export async function getDeliveryConfig(): Promise<DeliveryConfigResult> {
   const defaultConfig = { free_threshold: 30, delivery_fee: 8 };

   try {
      const res = await wx.cloud.callFunction({
         name: 'get-delivery-config',
         data: {},
      });

      const result = res.result as {
         success: boolean;
         data?: DeliveryConfigResult;
      };

      if (result.success && result.data) {
         return {
            free_threshold: result.data.free_threshold,
            delivery_fee: result.data.delivery_fee,
         };
      }
      return { ...defaultConfig };
   } catch {
      return { ...defaultConfig };
   }
}

/**
 * 计算配送费
 */
export function calcDeliveryFee(
   totalAmount: number,
   deliveryType: 'pickup' | 'delivery',
   config: DeliveryConfigResult,
): number {
   if (deliveryType === 'pickup') return 0;
   return totalAmount >= config.free_threshold ? 0 : config.delivery_fee;
}
