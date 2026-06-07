import { db, getOpenId } from '../utils/database';

interface UpdateProfileParams {
   phone?: string;
   address?: string;
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

   // 先读取当前用户数据（用于 phone 绑定校验）
   const { data: existingUser } = await db.collection('users').doc(openid).get();
   if (!existingUser) {
      return { success: false, message: 'User not found' };
   }

   const updateData: Record<string, string> = {};

   // phone 绑定保护：已有值则整体拒绝
   if (event.phone !== undefined) {
      if ((existingUser as Record<string, unknown>).phone) {
         return { success: false, message: '手机号已绑定，不可修改' };
      }
      if (!/^1[3-9]\d{9}$/.test(event.phone)) {
         return { success: false, message: '手机号格式不正确' };
      }
      updateData.phone = event.phone;
   }

   // address 自由更新
   if (event.address !== undefined) {
      updateData.address = event.address;
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
