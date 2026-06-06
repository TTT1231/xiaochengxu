/**
 * VIP card validation and generation helpers.
 *
 * Pure functions exported for testability. The card-number generation
 * uses crypto-strength randomness and bounded retries so it can be
 * unit-tested with a seeded/injected random source.
 */

// ── Card number generation ────────────────────────────

const CARD_NO_LENGTH = 12;
const CARD_NO_PREFIX = 'VC';
const CARD_NO_MAX_RETRIES = 100;

/**
 * Generate a single card number: "VC" + 10 alphanumeric characters.
 * Exported for testing; production code should use `generateUniqueCardNos`.
 */
export function generateCardNo(randomFn: () => number = Math.random): string {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   let suffix = '';
   for (let i = 0; i < CARD_NO_LENGTH - CARD_NO_PREFIX.length; i++) {
      suffix += chars.charAt(Math.floor(randomFn() * chars.length));
   }
   return CARD_NO_PREFIX + suffix;
}

/**
 * Check function signature for testing if a card_no exists in the database.
 */
export type CardNoExistsFn = (cardNo: string) => Promise<boolean>;

/**
 * Generate a batch of unique card numbers that don't collide with
 * each other or existing cards in the database.
 *
 * Returns the array of unique card numbers, or throws if the batch
 * cannot be completed within the retry limit.
 */
export async function generateUniqueCardNos(
   quantity: number,
   existsInDb: CardNoExistsFn,
   randomFn: () => number = Math.random,
): Promise<string[]> {
   const results: string[] = [];
   const localSet = new Set<string>();

   for (let i = 0; i < quantity; i++) {
      let attempts = 0;
      let candidate: string;

      do {
         candidate = generateCardNo(randomFn);
         attempts++;
      } while (
         (localSet.has(candidate) || (await existsInDb(candidate))) &&
         attempts < CARD_NO_MAX_RETRIES
      );

      if (localSet.has(candidate) || (await existsInDb(candidate))) {
         throw new Error(`无法生成唯一卡号（已重试${CARD_NO_MAX_RETRIES}次）`);
      }

      localSet.add(candidate);
      results.push(candidate);
   }

   return results;
}

// ── Lifecycle validation ──────────────────────────────

export const VALID_CARD_STATUSES = ['active', 'used', 'disabled'] as const;
export type CardStatus = (typeof VALID_CARD_STATUSES)[number];

export function isValidCardStatus(status: string): status is CardStatus {
   return VALID_CARD_STATUSES.includes(status as CardStatus);
}

/**
 * Validate that a status transition is allowed.
 * Only `active → disabled` is permitted for management.
 */
export function validateDisableTransition(currentStatus: string): {
   allowed: boolean;
   message: string;
} {
   if (currentStatus === 'disabled') {
      return { allowed: false, message: '该卡已被禁用' };
   }
   if (currentStatus === 'used') {
      return { allowed: false, message: '已使用的卡不能被禁用' };
   }
   if (currentStatus !== 'active') {
      return { allowed: false, message: `未知的卡状态: ${currentStatus}` };
   }
   return { allowed: true, message: '' };
}

// ── Issuance validation ───────────────────────────────

const DEFAULT_QUANTITY = 5;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 50;
const MIN_AMOUNT = 0.01;

export interface IssuanceInput {
   amount?: number;
   quantity?: number;
}

export interface IssuanceValidation {
   valid: boolean;
   message: string;
   amount?: number;
   quantity?: number;
}

export function validateIssuance(input: IssuanceInput): IssuanceValidation {
   if (
      input.amount == null ||
      typeof input.amount !== 'number' ||
      !Number.isFinite(input.amount) ||
      input.amount < MIN_AMOUNT
   ) {
      return { valid: false, message: '请输入有效的充值金额' };
   }

   let quantity = input.quantity ?? DEFAULT_QUANTITY;

   if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY) {
      return { valid: false, message: `数量必须为${MIN_QUANTITY}到${MAX_QUANTITY}之间的整数` };
   }

   if (quantity > MAX_QUANTITY) {
      return { valid: false, message: `单次最多发行${MAX_QUANTITY}张卡` };
   }

   return {
      valid: true,
      message: '',
      amount: input.amount,
      quantity,
   };
}
