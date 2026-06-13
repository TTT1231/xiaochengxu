import { db, cloud } from '../utils/database';
import type { CloudContext } from '../utils/database';

const DEFAULT_HOURS = {
   open_time: '09:00',
   close_time: '22:00',
};

export async function main(): Promise<
   | {
        success: true;
        data?: { open_time: string; close_time: string; updated_at?: string };
        message: string;
     }
   | {
        success: false;
        message: string;
     }
> {
   try {
      const { data } = await db.collection('business_hours').doc('config').get();
      if (!data) {
         return {
            success: true,
            data: { ...DEFAULT_HOURS },
            message: '使用默认配置',
         };
      }
      return {
         success: true,
         data: {
            open_time: (data.open_time ?? DEFAULT_HOURS.open_time) as string,
            close_time: (data.close_time ?? DEFAULT_HOURS.close_time) as string,
            updated_at: data.updated_at as string,
         },
         message: 'Success',
      };
   } catch (error) {
      const wxContext = cloud.getWXContext() as CloudContext;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[get-business-hours] 读取失败', msg, 'openid:', wxContext.OPENID);
      // 异常时返回默认值，保证核心流程可用
      return {
         success: true,
         data: { ...DEFAULT_HOURS },
         message: '使用默认配置',
      };
   }
}
