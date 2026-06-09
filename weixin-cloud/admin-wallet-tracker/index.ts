import { db } from '../utils/database';
import { authorizeAdmin, AuthorizationError } from '../utils/admin-auth';

// ── Types ─────────────────────────────────────────────

interface WalletTrackerParams {
   keyword: string;
   adminOpenId?: string;
}

interface UserDoc {
   _id: string;
   name: string;
   id: string;
   phone?: string;
   avatar?: string;
}

interface WalletDoc {
   _id: string;
   user_id: string;
   balance: number;
   total_recharged: number;
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

/** Detect keyword type: phone (11 digits), user ID (7 digits), or raw openid */
function detectKeywordType(keyword: string): 'phone' | 'userId' | 'openid' {
   if (/^\d{11}$/.test(keyword)) return 'phone';
   if (/^\d{7}$/.test(keyword)) return 'userId';
   return 'openid';
}

/** Find user by keyword. Returns null if not found. */
async function findUser(keyword: string): Promise<UserDoc | null> {
   const type = detectKeywordType(keyword);

   if (type === 'phone') {
      const { data } = await db.collection('users').where({ phone: keyword }).limit(1).get();
      if (data.length > 0 && isUserDoc(data[0])) return data[0];
   }

   if (type === 'userId') {
      const { data } = await db.collection('users').where({ id: keyword }).limit(1).get();
      if (data.length > 0 && isUserDoc(data[0])) return data[0];
   }

   if (type === 'openid') {
      try {
         const { data } = await db.collection('users').doc(keyword).get();
         if (data && isUserDoc(data)) return data as UserDoc;
      } catch {
         // doc not found
      }
   }

   // Fallback: if phone or userId didn't match, try openid as last resort
   if (type !== 'openid') {
      try {
         const { data } = await db.collection('users').doc(keyword).get();
         if (data && isUserDoc(data)) return data as UserDoc;
      } catch {
         // doc not found
      }
   }

   return null;
}

// ── Main ──────────────────────────────────────────────

export async function main(
   event: WalletTrackerParams,
): Promise<{ success: boolean; data?: Record<string, unknown>; message: string }> {
   try {
      await authorizeAdmin(event.adminOpenId);
   } catch (error) {
      if (isAuthorizationError(error)) {
         return { success: false, message: error.message };
      }
      return { success: false, message: '管理员身份验证失败' };
   }

   const { keyword } = event;
   if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return { success: false, message: '请输入手机号、用户ID或 _id' };
   }

   const trimmed = keyword.trim();

   try {
      // 1. Find user
      const userDoc = await findUser(trimmed);
      if (!userDoc) {
         return { success: false, message: '未找到该用户' };
      }

      // 2. Find wallet (may not exist for non-VIP)
      let wallet: WalletDoc | null = null;
      const walletResult = await db
         .collection('wallets')
         .where({ user_id: userDoc._id })
         .limit(1)
         .get();
      if (walletResult.data.length > 0 && isWalletDoc(walletResult.data[0])) {
         wallet = walletResult.data[0];
      }

      // 3. Find orders where wallet_deduct > 0
      const cmd = db.command;
      const { data: orders } = await db
         .collection('orders')
         .where({
            user_id: userDoc._id,
            wallet_deduct: cmd.gt(0),
         })
         .orderBy('created_at', 'desc')
         .limit(100)
         .get();

      // 4. Return result
      return {
         success: true,
         data: {
            user: {
               _id: userDoc._id,
               name: userDoc.name,
               id: userDoc.id,
               phone: userDoc.phone ?? '',
            },
            wallet: wallet
               ? { balance: wallet.balance, total_recharged: wallet.total_recharged }
               : null,
            orders,
         },
         message: 'Success',
      };
   } catch (error) {
      console.error('admin-wallet-tracker error:', error);
      return { success: false, message: '查询失败，请稍后重试' };
   }
}
