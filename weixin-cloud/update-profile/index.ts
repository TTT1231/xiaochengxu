import { db, getOpenId } from '../utils/database';

interface UpdateProfileParams {
   name?: string;
   phone?: string;
}

interface UpdateProfileResult {
   success: boolean;
   message: string;
}

export async function main(event: UpdateProfileParams): Promise<UpdateProfileResult> {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const updateData: Record<string, string> = {};

   if (event.name !== undefined) {
      const trimmed = event.name.trim();
      if (trimmed.length === 0 || trimmed.length > 20) {
         return { success: false, message: '昵称长度需在1-20个字符之间' };
      }
      updateData.name = trimmed;
   }

   if (event.phone !== undefined) {
      if (!/^1[3-9]\d{9}$/.test(event.phone)) {
         return { success: false, message: '手机号格式不正确' };
      }
      updateData.phone = event.phone;
   }

   if (Object.keys(updateData).length === 0) {
      return { success: false, message: '没有需要更新的字段' };
   }

   try {
      await db.collection('users').doc(openid).update({ data: updateData });
      return { success: true, message: '更新成功' };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: '更新失败: ' + msg };
   }
}
