export interface BusinessHours {
   open_time: string;
   close_time: string;
}

/** 营业时间默认值（配置缺失/异常时兜底，保证下单流程不中断） */
const DEFAULT_BUSINESS_HOURS: BusinessHours = {
   open_time: '09:00',
   close_time: '22:00',
};

/**
 * 获取营业时间配置
 * @returns 营业时间（获取失败时返回默认值 09:00-22:00，保证核心流程可用）
 */
export async function getBusinessHours(): Promise<BusinessHours> {
   try {
      const res = await wx.cloud.callFunction({
         name: 'get-business-hours',
         data: {},
      });

      const result = res.result as {
         success: boolean;
         data?: BusinessHours;
      };

      if (result.success && result.data) {
         return {
            open_time: result.data.open_time,
            close_time: result.data.close_time,
         };
      }
      return { ...DEFAULT_BUSINESS_HOURS };
   } catch {
      return { ...DEFAULT_BUSINESS_HOURS };
   }
}
