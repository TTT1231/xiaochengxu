import { db, cloud } from '../utils/database';
import type { CloudContext } from '../utils/database';

const DEFAULT_CONFIG = {
   free_threshold: 30,
   delivery_fee: 8,
};

export async function main(): Promise<
   | {
        success: true;
        data?: { free_threshold: number; delivery_fee: number; updated_at?: string };
        message: string;
     }
   | {
        success: false;
        message: string;
     }
> {
   try {
      const { data } = await db.collection('delivery_config').doc('config').get();
      if (!data) {
         return {
            success: true,
            data: { ...DEFAULT_CONFIG },
            message: '使用默认配置',
         };
      }
      return {
         success: true,
         data: {
            free_threshold: data.free_threshold as number,
            delivery_fee: data.delivery_fee as number,
            updated_at: data.updated_at as string,
         },
         message: 'Success',
      };
   } catch (error) {
      const wxContext = cloud.getWXContext() as CloudContext;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[get-delivery-config] 读取失败', msg, 'openid:', wxContext.OPENID);
      // 异常时返回默认值，保证核心流程可用
      return {
         success: true,
         data: { ...DEFAULT_CONFIG },
         message: '使用默认配置',
      };
   }
}
