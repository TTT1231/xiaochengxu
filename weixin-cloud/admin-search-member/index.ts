import { db } from '../utils/database';
import { authorizeAdmin, AuthorizationError } from '../utils/admin-auth';

// ── Types ─────────────────────────────────────────────

interface SearchMemberParams {
   keyword: string;
}

interface UserDoc {
   _id: string;
   name: string;
   id: string;
   phone?: string;
}

interface WalletDoc {
   _id: string;
   user_id: string;
   balance: number;
}

// ── Helpers ───────────────────────────────────────────

function isAuthorizationError(error: unknown): error is AuthorizationError {
   return error instanceof AuthorizationError;
}

function isUserDoc(doc: unknown): doc is UserDoc {
   return typeof doc === 'object' && doc !== null && 'name' in doc && 'id' in doc;
}

function isWalletDoc(doc: unknown): doc is WalletDoc {
   return typeof doc === 'object' && doc !== null && 'balance' in doc;
}

// ── Main ──────────────────────────────────────────────

export async function main(
   event: SearchMemberParams,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   try {
      await authorizeAdmin((event as { adminOpenId?: string }).adminOpenId);
   } catch (error) {
      if (isAuthorizationError(error)) {
         return { success: false, message: error.message };
      }
      return { success: false, message: '管理员身份验证失败' };
   }

   const { keyword } = event;
   if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return { success: false, message: '请输入手机号或用户ID' };
   }

   const trimmed = keyword.trim();

   try {
      // 1. Search users by phone first, then by 7-digit ID
      let userDoc: UserDoc | null = null;

      const phoneResult = await db.collection('users').where({ phone: trimmed }).limit(1).get();

      if (phoneResult.data.length > 0 && isUserDoc(phoneResult.data[0])) {
         userDoc = phoneResult.data[0];
      } else {
         const idResult = await db.collection('users').where({ id: trimmed }).limit(1).get();

         if (idResult.data.length > 0 && isUserDoc(idResult.data[0])) {
            userDoc = idResult.data[0];
         }
      }

      if (!userDoc) {
         return { success: false, message: '未找到该用户' };
      }

      // 2. Check wallet — no wallet record means NOT a VIP member
      const walletResult = await db
         .collection('wallets')
         .where({ user_id: userDoc._id })
         .limit(1)
         .get();

      if (walletResult.data.length === 0) {
         return { success: false, message: '该用户不是会员' };
      }

      const wallet = walletResult.data[0];
      if (!isWalletDoc(wallet)) {
         return { success: false, message: '该用户不是会员' };
      }

      // 3. Return user info + wallet balance
      return {
         success: true,
         data: {
            user: {
               openid: userDoc._id,
               name: userDoc.name,
               id: userDoc.id,
               phone: userDoc.phone ?? '',
            },
            wallet: {
               balance: wallet.balance,
            },
         },
         message: 'Success',
      };
   } catch (error) {
      console.error('admin-search-member error:', error);
      return { success: false, message: '检索失败，请稍后重试' };
   }
}
