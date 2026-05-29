import { db } from './database';

export interface WalletFields {
   balance: number;
   total_recharged: number;
}

/** Recharge: increase balance and total_recharged. Throws on non-positive amount. */
export function rechargeWallet(current: WalletFields, amount: number): WalletFields {
   if (amount <= 0) {
      throw new Error('Recharge amount must be positive');
   }
   return {
      balance: current.balance + amount,
      total_recharged: current.total_recharged + amount,
   };
}

/** Deduct balance for an order. Throws if amount exceeds balance or is negative. */
export function deductWallet(current: WalletFields, amount: number): WalletFields {
   if (amount < 0) {
      throw new Error('Deduct amount cannot be negative');
   }
   if (amount > current.balance) {
      throw new Error('Insufficient balance');
   }
   return {
      balance: current.balance - amount,
      total_recharged: current.total_recharged,
   };
}

/** Refund balance on order cancellation. Throws on negative amount. */
export function refundWallet(current: WalletFields, amount: number): WalletFields {
   if (amount < 0) {
      throw new Error('Refund amount cannot be negative');
   }
   return {
      balance: current.balance + amount,
      total_recharged: current.total_recharged,
   };
}

/** Find wallet by user_id. Returns null if not found. */
export async function findWalletByUserId(openid: string): Promise<Record<string, unknown> | null> {
   const { data: wallets } = await db.collection('wallets').where({ user_id: openid }).limit(1).get();
   return wallets.length > 0 ? wallets[0] : null;
}
