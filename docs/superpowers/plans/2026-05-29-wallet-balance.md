# Wallet Balance System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy points/credits system with a wallet-based balance system supporting simulated recharge and order deduction.

**Base commit:** `1d7b63b` — user has already simplified `useUserLevel` to 2 levels and updated profile component visuals. The plan accounts for these existing changes.

**Architecture:** New `wallets` collection replaces `credits`. Cloud functions are updated to read/write wallets instead of credits and to remove all level-based logic. Frontend replaces points mall page with a wallet page, and `useUserLevel` signature changes from `level: string` to `isVip: boolean`.

**Tech Stack:** TypeScript, uni-app (Vue 3), WeChat Cloud Functions (wx-server-sdk), Pinia, SCSS, vitest

---

## File Structure

### Cloud Functions (weixin-cloud/)

| File | Action | Responsibility |
|------|--------|---------------|
| `utils/wallet.ts` | **Create** | Wallet helper functions: `findWallet`, `rechargeWallet`, `deductWallet`, `refundWallet` |
| `utils/credits.ts` | **Delete** | Entire file removed |
| `utils/database.ts` | **Modify** | Remove `VALID_USER_LEVELS`, `UserLevel`, `isValidUserLevel`, `LEVEL_THRESHOLDS`, `getLevelForScore` |
| `recharge/index.ts` | **Create** | Simulated recharge cloud function |
| `create-order/index.ts` | **Modify** | Add `walletDeduct` param, replace credits logic with wallet deduction |
| `cancel-order/index.ts` | **Modify** | Replace credits subtraction with wallet refund |
| `user-login/index.ts` | **Modify** | Create wallet instead of credits, return wallet, remove `level` from new user |
| `get-profile/index.ts` | **Modify** | Query wallets instead of credits, return wallet |
| `database-schema.md` | **Modify** | Add wallets collection, deprecate credits, remove level from users |

### Frontend Types (src/types/)

| File | Action | Responsibility |
|------|--------|---------------|
| `db-scheme/wallets.ts` | **Create** | `Wallets` interface |
| `db-scheme/users.ts` | **Modify** | Remove `level` field, keep `Credits` deprecated |
| `db-scheme/orders.ts` | **Modify** | Add `wallet_deduct` field |
| `db-scheme/index.ts` | **Modify** | Add `Wallets` export |
| `index.ts` | **Modify** | Add `Wallets` export, keep `Credits` for backward compat |

### Frontend Core (src/)

| File | Action | Responsibility |
|------|--------|---------------|
| `composables/useUserLevel.ts` | **Modify** | Change signature from `level: string` to `isVip: boolean` |
| `stores/modules/userStore.ts` | **Modify** | `credits` → `wallet`, add `recharge()` action, add `isVip` getter |
| `api/userApi.ts` | **Modify** | Types use `Wallet` instead of `Credits`, add `rechargeWallet()` |
| `api/orderApi.ts` | **Modify** | Add `walletDeduct` to `createOrder` params |
| `utils/format.ts` | **Modify** | Rename `formatPoints` → `formatBalance` |

### Frontend Pages (src/pages/)

| File | Action | Responsibility |
|------|--------|---------------|
| `wallet/index.vue` | **Create** | Balance page with card, recharge area |
| `points/index.vue` | **Delete** | Points mall page removed |

### Frontend Components (src/components/)

| File | Action | Responsibility |
|------|--------|---------------|
| `points/PointsCard.vue` | **Delete** | Points card removed |
| `points/RewardCard.vue` | **Delete** | Reward card removed |
| `profile/StatsCard.vue` | **Modify** | Props: `points` + `level` → `balance` + `isVip`, navigate to wallet |
| `profile/UserCard.vue` | **Modify** | Props: accept `isVip: boolean` instead of reading `user.level` |
| `profile/MenuList.vue` | **Modify** | Props: `level?: string` → `isVip: boolean` |

### Frontend Pages That Use Components

| File | Action | Responsibility |
|------|--------|---------------|
| `pages/profile/index.vue` | **Modify** | Derive `isVip` from wallet, pass to components instead of `level` |
| `pages/cart/index.vue` | **Modify** | Add wallet deduction UI in bottom bar |

### Frontend Mock Data

| File | Action | Responsibility |
|------|--------|---------------|
| `mock/user.ts` | **Delete** | Reward type and hotRewards removed |
| `mock/index.ts` | **Delete** | Mock barrel file removed |

### Config

| File | Action | Responsibility |
|------|--------|---------------|
| `pages.json` | **Modify** | Add `pages/wallet/index`, remove `pages/points/index` |

### Tests

| File | Action | Responsibility |
|------|--------|---------------|
| `tests/cloud/wallet.test.ts` | **Create** | Tests for wallet utility functions |
| `tests/cloud/credits.test.ts` | **Delete** | Credits tests removed |
| `tests/cloud/database.test.ts` | **Modify** | Remove level/score related tests |

---

## Task 1: Create Wallet Types (Frontend)

**Files:**
- Create: `src/types/db-scheme/wallets.ts`
- Modify: `src/types/db-scheme/users.ts`
- Modify: `src/types/db-scheme/orders.ts`
- Modify: `src/types/db-scheme/index.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create wallets type definition**

Create `src/types/db-scheme/wallets.ts`:

```typescript
/** 用户钱包表 */
export interface Wallets {
   _id: string;
   /** 关联用户 openid */
   user_id: string;
   /** 当前余额（元） */
   balance: number;
   /** 累计充值金额（元） */
   total_recharged: number;
   /** 创建时间 */
   created_at: string;
   /** 最后更新时间 */
   updated_at: string;
}
```

- [ ] **Step 2: Update users.ts — remove `level`, deprecate Credits**

Current state (`1d7b63b`) has `level: string` in `Users`. Remove it:

```typescript
/** 用户表 */
export interface Users {
   /** 文档 _id = openid (微信唯一用户标识) */
   _id: string;
   /** 用户名 */
   name: string;
   /** 唯一7位用户ID */
   id: string;
   /** 创建时间 */
   created_at: string;
   /** 手机号 */
   phone?: string;
}

/** @deprecated 旧积分表，已废弃，使用 Wallets 替代 */
export interface Credits {
   _id: string;
   /** 关联用户 openid */
   users_id: string;
   /** 累计积分 */
   total_scores: number;
   /** 可用积分 */
   available_scores: number;
}
```

- [ ] **Step 3: Update orders.ts — add `wallet_deduct`**

Current state (`1d7b63b`) does not have `wallet_deduct`. Add it:

```typescript
export interface Orders {
   /** 文档 _id = order_id (原子唯一性) */
   _id: string;
   /** 订单号 */
   order_id: string;
   /** 用户 ID (openid) */
   user_id: string;
   /** 订单状态 */
   order_status: string;
   /** 总金额（分）- 折前金额 */
   total_amount: number;
   /** 优惠金额（分） */
   discount_amount: number;
   /** 余额抵扣金额（元） */
   wallet_deduct: number;
   /** 创建时间 */
   created_at: string;
   /** 订单商品详情 */
   oder_details: OrderDetailItem[];
}
```

- [ ] **Step 4: Update db-scheme/index.ts**

Current state: exports `Credits, Users` from users. Add `Wallets`:

```typescript
export type { Categoried } from './categoried';
export type { OrderDetailItem, Orders } from './orders';
export type { ProductSpecOption, ProductSpecGroup, ProductSpecs, Products } from './products';
export type { Credits, Users } from './users';
export type { Wallets } from './wallets';
```

- [ ] **Step 5: Update types/index.ts**

Current state: exports `Credits, Users` etc. Add `Wallets`:

```typescript
export type { OrderStatus } from './constants';
export { ORDER_STATUS_TEXT } from './constants';

export type {
   Categoried,
   Credits,
   OrderDetailItem,
   Orders,
   ProductSpecOption,
   ProductSpecGroup,
   ProductSpecs,
   Products,
   Users,
   Wallets,
} from './db-scheme';
```

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat(types): add Wallets type and remove level from Users"
```

---

## Task 2: Create Wallet Utility (Cloud Function)

**Files:**
- Create: `weixin-cloud/utils/wallet.ts`
- Create: `tests/cloud/wallet.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/cloud/wallet.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { rechargeWallet, deductWallet, refundWallet } from '../../weixin-cloud/utils/wallet';

describe('rechargeWallet', () => {
   it('adds amount to balance and total_recharged', () => {
      const wallet = { balance: 10, total_recharged: 50 };
      const result = rechargeWallet(wallet, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(70);
   });

   it('throws on non-positive amount', () => {
      expect(() => rechargeWallet({ balance: 10, total_recharged: 50 }, 0)).toThrow();
      expect(() => rechargeWallet({ balance: 10, total_recharged: 50 }, -5)).toThrow();
   });
});

describe('deductWallet', () => {
   it('deducts amount from balance', () => {
      const result = deductWallet({ balance: 50, total_recharged: 100 }, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(100);
   });

   it('throws when deducting more than balance', () => {
      expect(() => deductWallet({ balance: 10, total_recharged: 50 }, 20)).toThrow();
   });

   it('throws on negative amount', () => {
      expect(() => deductWallet({ balance: 50, total_recharged: 100 }, -1)).toThrow();
   });

   it('allows deducting exact balance', () => {
      const result = deductWallet({ balance: 50, total_recharged: 100 }, 50);
      expect(result.balance).toBe(0);
   });
});

describe('refundWallet', () => {
   it('adds refund amount back to balance', () => {
      const result = refundWallet({ balance: 10, total_recharged: 100 }, 20);
      expect(result.balance).toBe(30);
      expect(result.total_recharged).toBe(100);
   });

   it('throws on negative refund', () => {
      expect(() => refundWallet({ balance: 10, total_recharged: 100 }, -5)).toThrow();
   });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/cloud/wallet.test.ts`
Expected: FAIL — module `../../weixin-cloud/utils/wallet` not found

- [ ] **Step 3: Write wallet utility**

Create `weixin-cloud/utils/wallet.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/cloud/wallet.test.ts`
Expected: 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add weixin-cloud/utils/wallet.ts tests/cloud/wallet.test.ts
git commit -m "feat(cloud): add wallet utility functions with tests"
```

---

## Task 3: Clean Up Database Utils and Credits

**Files:**
- Modify: `weixin-cloud/utils/database.ts`
- Delete: `weixin-cloud/utils/credits.ts`
- Modify: `tests/cloud/database.test.ts`
- Delete: `tests/cloud/credits.test.ts`

- [ ] **Step 1: Update database.ts — remove level-related code**

Current state (`1d7b63b`) still has `VALID_USER_LEVELS`, `UserLevel`, `isValidUserLevel`, `LEVEL_THRESHOLDS`, `getLevelForScore`. Remove them all:

```typescript
import cloud from 'wx-server-sdk';

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const VALID_ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export function isValidOrderStatus(status: string): status is OrderStatus {
   return VALID_ORDER_STATUSES.includes(status as OrderStatus);
}

export interface CloudContext {
   OPENID: string;
}

export function getOpenId(): string {
   const wxContext = cloud.getWXContext() as CloudContext;
   return wxContext.OPENID;
}

export { db, cloud };
```

- [ ] **Step 2: Delete credits utility**

Delete `weixin-cloud/utils/credits.ts`.

- [ ] **Step 3: Update database.test.ts — remove level/score tests**

Current state (`1d7b63b`) still has `isValidUserLevel` and `getLevelForScore` tests. Remove them:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('wx-server-sdk', () => ({
   default: {
      init: vi.fn(),
      DYNAMIC_CURRENT_ENV: 'test-env',
      database: vi.fn(() => ({})),
      getWXContext: vi.fn(),
   },
}));

import { isValidOrderStatus } from '../../weixin-cloud/utils/database';

describe('isValidOrderStatus', () => {
   it.each(['pending', 'preparing', 'ready', 'completed', 'cancelled'])('accepts %s', status => {
      expect(isValidOrderStatus(status)).toBe(true);
   });

   it('rejects invalid statuses', () => {
      expect(isValidOrderStatus('shipped')).toBe(false);
      expect(isValidOrderStatus('')).toBe(false);
      expect(isValidOrderStatus('PENDING')).toBe(false);
   });
});
```

- [ ] **Step 4: Delete credits tests**

Delete `tests/cloud/credits.test.ts`.

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (database.test.ts 3 tests, wallet.test.ts 8 tests, plus existing API tests)

- [ ] **Step 6: Commit**

```bash
git add weixin-cloud/utils/database.ts weixin-cloud/utils/credits.ts tests/cloud/database.test.ts tests/cloud/credits.test.ts
git commit -m "refactor(cloud): remove credits utility and level logic from database utils"
```

---

## Task 4: Create Recharge Cloud Function

**Files:**
- Create: `weixin-cloud/recharge/index.ts`

- [ ] **Step 1: Create recharge cloud function**

Create `weixin-cloud/recharge/index.ts`:

```typescript
import { db, getOpenId } from '../utils/database';
import { rechargeWallet, findWalletByUserId } from '../utils/wallet';

interface RechargeParams {
   amount: number;
}

export async function main(event: RechargeParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { amount } = event;
   if (!amount || typeof amount !== 'number' || amount <= 0) {
      return { success: false, message: 'Invalid amount' };
   }

   try {
      let wallet = await findWalletByUserId(openid);

      if (!wallet) {
         const now = new Date().toISOString();
         const { _id } = await db.collection('wallets').add({
            data: { user_id: openid, balance: 0, total_recharged: 0, created_at: now, updated_at: now },
         });
         wallet = { _id, user_id: openid, balance: 0, total_recharged: 0, created_at: now, updated_at: now };
      }

      const updated = rechargeWallet(
         { balance: wallet.balance as number, total_recharged: wallet.total_recharged as number },
         amount,
      );
      const now = new Date().toISOString();
      await db
         .collection('wallets')
         .doc(wallet._id as string)
         .update({ data: { ...updated, updated_at: now } });

      return {
         success: true,
         data: { wallet: { ...wallet, ...updated, updated_at: now } },
         message: 'Recharge successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Recharge failed: ' + msg };
   }
}
```

- [ ] **Step 2: Commit**

```bash
git add weixin-cloud/recharge/
git commit -m "feat(cloud): add recharge cloud function"
```

---

## Task 5: Modify Create-Order Cloud Function

**Files:**
- Modify: `weixin-cloud/create-order/index.ts`

- [ ] **Step 1: Replace create-order with wallet deduction logic**

Replace the contents of `weixin-cloud/create-order/index.ts`:

```typescript
import { db, getOpenId } from '../utils/database';
import { deductWallet, findWalletByUserId } from '../utils/wallet';

const MAX_CART_ITEMS = 20;

interface CartItem {
   product_id: string;
   product_name: string;
   product_image: string;
   specs: Record<string, string>;
   price: number;
   discount: number;
   quantity: number;
}

interface CreateOrderParams {
   items: CartItem[];
   totalAmount: number;
   discountAmount: number;
   walletDeduct?: number;
}

function generateOrderId(): string {
   const timestamp = Date.now().toString(36).toUpperCase();
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return 'OD' + timestamp + random;
}

export async function main(event: CreateOrderParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { items, totalAmount, discountAmount, walletDeduct = 0 } = event;

   if (!items || items.length === 0) {
      return { success: false, message: 'Cart is empty' };
   }
   if (items.length > MAX_CART_ITEMS) {
      return { success: false, message: 'Too many items (max ' + MAX_CART_ITEMS + ')' };
   }
   if (walletDeduct < 0) {
      return { success: false, message: 'Invalid wallet deduction' };
   }

   // Step 1: Validate products OUTSIDE transaction (read-only)
   const validatedItems: CartItem[] = [];
   for (const item of items) {
      if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
         return { success: false, message: 'Invalid item data' };
      }
      try {
         const { data: product } = await db.collection('products').doc(item.product_id).get();
         if (!product) {
            return { success: false, message: 'Product not found: ' + item.product_id };
         }
         validatedItems.push({
            product_id: item.product_id,
            product_name: product.name,
            product_image: item.product_image,
            specs: item.specs,
            price: product.price,
            discount: product.discount,
            quantity: item.quantity,
         });
      } catch {
         return { success: false, message: 'Product not found: ' + item.product_id };
      }
   }

   // Step 2: Validate totals using SERVER-SIDE prices
   const expectedTotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
   const expectedDiscount = validatedItems.reduce((sum, item) => sum + item.discount * item.quantity, 0);

   const EPSILON = 0.01;
   if (Math.abs(totalAmount - expectedTotal) > EPSILON) {
      return { success: false, message: 'Total amount mismatch' };
   }
   if (Math.abs(discountAmount - expectedDiscount) > EPSILON) {
      return { success: false, message: 'Discount amount mismatch' };
   }

   // Step 3: Validate wallet deduction if provided
   if (walletDeduct > 0) {
      const wallet = await findWalletByUserId(openid);
      if (!wallet) {
         return { success: false, message: 'Wallet not found' };
      }
      if (walletDeduct > (wallet.balance as number)) {
         return { success: false, message: 'Insufficient balance' };
      }
   }

   const orderId = generateOrderId();
   const now = new Date().toISOString();

   // Step 4: Create order (standalone, no transaction)
   try {
      await db
         .collection('orders')
         .add({
            data: {
               _id: orderId,
               order_id: orderId,
               user_id: openid,
               order_status: 'pending',
               total_amount: totalAmount,
               discount_amount: discountAmount,
               wallet_deduct: walletDeduct,
               created_at: now,
               oder_details: validatedItems,
            },
         });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order creation failed: ' + msg };
   }

   // Step 5: Deduct wallet balance (best-effort, must NOT roll back the order)
   if (walletDeduct > 0) {
      try {
         const wallet = await findWalletByUserId(openid);
         if (wallet) {
            const updated = deductWallet(
               { balance: wallet.balance as number, total_recharged: wallet.total_recharged as number },
               walletDeduct,
            );
            await db
               .collection('wallets')
               .doc(wallet._id as string)
               .update({ data: { ...updated, updated_at: new Date().toISOString() } });
         }
      } catch {
         // Wallet deduction failed — order is still valid, ignore
      }
   }

   return { success: true, data: { order_id: orderId }, message: 'Order created' };
}
```

- [ ] **Step 2: Commit**

```bash
git add weixin-cloud/create-order/index.ts
git commit -m "refactor(cloud): replace credits with wallet deduction in create-order"
```

---

## Task 6: Modify Cancel-Order Cloud Function

**Files:**
- Modify: `weixin-cloud/cancel-order/index.ts`

- [ ] **Step 1: Replace cancel-order with wallet refund logic**

Replace the contents of `weixin-cloud/cancel-order/index.ts`:

```typescript
import { db, getOpenId } from '../utils/database';
import { refundWallet, findWalletByUserId } from '../utils/wallet';

interface CancelOrderParams {
   orderId: string;
}

export async function main(event: CancelOrderParams) {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   const { orderId } = event;
   if (!orderId) {
      return { success: false, message: 'Order ID is required' };
   }

   try {
      return await db.runTransaction(async (transaction) => {
         let order: Record<string, unknown> | null = null;
         try {
            ({ data: order } = await transaction.collection('orders').doc(orderId).get());
         } catch {
            // Document doesn't exist
         }
         if (!order) {
            return { success: false, message: 'Order not found' };
         }

         if (order.user_id !== openid) {
            return { success: false, message: 'Order not found' };
         }

         if (order.order_status !== 'pending' && order.order_status !== 'preparing') {
            return { success: false, message: 'Order cannot be cancelled (status: ' + order.order_status + ')' };
         }

         await transaction
            .collection('orders')
            .doc(orderId)
            .update({ data: { order_status: 'cancelled' } });

         // Refund wallet balance if any was deducted
         const walletDeduct = (order.wallet_deduct as number) || 0;
         if (walletDeduct > 0) {
            const { data: wallets } = await transaction
               .collection('wallets')
               .where({ user_id: openid })
               .limit(1)
               .get();

            if (wallets.length > 0) {
               const wallet = wallets[0];
               const updated = refundWallet(
                  { balance: wallet.balance as number, total_recharged: wallet.total_recharged as number },
                  walletDeduct,
               );
               await transaction
                  .collection('wallets')
                  .doc(wallet._id as string)
                  .update({ data: { ...updated, updated_at: new Date().toISOString() } });
            }
         }

         return { success: true, data: { order_id: orderId }, message: 'Order cancelled' };
      });
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Order cancellation failed: ' + msg };
   }
}
```

- [ ] **Step 2: Commit**

```bash
git add weixin-cloud/cancel-order/index.ts
git commit -m "refactor(cloud): replace credits with wallet refund in cancel-order"
```

---

## Task 7: Modify User-Login and Get-Profile Cloud Functions

**Files:**
- Modify: `weixin-cloud/user-login/index.ts`
- Modify: `weixin-cloud/get-profile/index.ts`

- [ ] **Step 1: Update user-login — create wallet instead of credits**

Current state (`1d7b63b`) creates `credits` and sets `level: '普通用户'`. Replace:

```typescript
import { db, getOpenId } from '../utils/database';
import { generateUniqueDisplayId } from '../utils/id-generator';

interface LoginResult {
   success: boolean;
   data?: {
      user: Record<string, unknown>;
      wallet: Record<string, unknown>;
      isNewUser: boolean;
   };
   message: string;
}

export async function main(): Promise<LoginResult> {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed: no OPENID' };
   }

   // Parallel: fetch user + wallet in one round-trip
   const [userRes, walletRes] = await Promise.all([
      db.collection('users').doc(openid).get().catch(() => null),
      db.collection('wallets').where({ user_id: openid }).limit(1).get(),
   ]);

   const user = userRes?.data;
   if (user) {
      const wallet = walletRes.data?.[0] || { user_id: openid, balance: 0, total_recharged: 0 };
      return {
         success: true,
         data: { user, wallet, isNewUser: false },
         message: 'Login successful',
      };
   }

   // New user: generate ID, then create user + wallet in transaction
   const displayId = await generateUniqueDisplayId();
   const now = new Date().toISOString();
   const defaultWallet = { user_id: openid, balance: 0, total_recharged: 0, created_at: now, updated_at: now };

   try {
      await db.runTransaction(async (transaction) => {
         await transaction.collection('users').add({
            data: { _id: openid, name: '微信用户', id: displayId, created_at: now },
         });
         await transaction.collection('wallets').add({ data: defaultWallet });
      });

      return {
         success: true,
         data: {
            user: { _id: openid, name: '微信用户', id: displayId, created_at: now },
            wallet: defaultWallet,
            isNewUser: true,
         },
         message: 'Registration successful',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Registration failed: ' + msg };
   }
}
```

- [ ] **Step 2: Update get-profile — query wallets instead of credits**

```typescript
import { db, getOpenId } from '../utils/database';

export async function main() {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   try {
      let user: Record<string, unknown> | null = null;
      try {
         ({ data: user } = await db.collection('users').doc(openid).get());
      } catch {
         // Document doesn't exist
      }
      if (!user) {
         return { success: false, message: 'User not found' };
      }

      const { data: wallets } = await db.collection('wallets').where({ user_id: openid }).limit(1).get();
      const wallet = wallets[0] || null;

      return {
         success: true,
         data: { user, wallet },
         message: 'Success',
      };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: 'Failed to get profile: ' + msg };
   }
}
```

- [ ] **Step 3: Commit**

```bash
git add weixin-cloud/user-login/index.ts weixin-cloud/get-profile/index.ts
git commit -m "refactor(cloud): replace credits with wallet in user-login and get-profile"
```

---

## Task 8: Update Database Schema Doc

**Files:**
- Modify: `weixin-cloud/database-schema.md`

- [ ] **Step 1: Replace the full schema doc**

Replace the contents of `weixin-cloud/database-schema.md`:

```markdown
# WeChat Cloud Database Schema

## Collections Overview

| Collection | `_id` Strategy | Client Access | Cloud Function Access |
|---|---|---|---|
| `users` | `openid` (string) | None | Admin |
| `products` | Original numeric ID (string) | Read-only | Admin |
| `orders` | `order_id` (string) | None | Admin |
| `wallets` | UUID (string) | None | Admin |
| `categoried` | Original numeric ID (string) | Read-only | Admin |

## Collection: `users`

```typescript
interface UserDocument {
  _id: string;          // openid (WeChat unique user ID)
  name: string;         // User display name
  id: string;           // 唯一7位用户ID (7-digit display ID)
  created_at: string;   // ISO timestamp
}
```

**Indexes:**
- `_id` (default) — unique, used for lookup by openid
- `id` — unique, used for display ID lookup

**Validation Rules:**
- `_id` must be non-empty string (openid)
- `id` must be unique 7-digit string

## Collection: `products`

```typescript
interface ProductDocument {
  _id: string;              // Original numeric ID as string (e.g. "1", "2")
  categoried_id: number;    // Category reference ID
  name: string;
  description: string;
  price: number;            // Unit: cents (分)
  images: string;           // WeChat Cloud fileIDs joined by "&"
  specs: ProductSpecs;      // JSON object
  discount: number;         // Discount amount in yuan (元), 0 = no discount
  status: boolean;          // true = on shelf, false = off shelf
}
```

**Indexes:**
- `_id` (default) — used in cloud function transactions via `doc(id).get()`
- `categoried_id` — for filtering by category

**Notes:**
- `_id` MUST preserve the original numeric ID. Cloud functions use `doc(id).get()` inside transactions which requires the exact `_id`.
- `images` stores WeChat Cloud fileIDs (`cloud://...`) separated by `&`. The `&` character is safe as it doesn't appear in fileIDs.

## Collection: `orders`

```typescript
interface OrderDocument {
  _id: string;               // Same as order_id (atomic uniqueness via doc ID)
  order_id: string;           // Generated unique order ID
  user_id: string;            // openid of the order owner
  order_status: string;       // 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number;       // Pre-discount total in cents (分)
  discount_amount: number;    // Total discount in cents (分)
  wallet_deduct: number;      // Balance deduction amount in yuan (元), default 0
  created_at: string;         // ISO timestamp
  oder_details: OrderDetailItem[]; // Note: historical typo preserved
}

interface OrderDetailItem {
  product_id: string;
  product_name: string;
  product_image: string;      // WeChat Cloud fileID
  specs: Record<string, string>;
  price: number;              // Unit price with spec surcharge in yuan (元)
  discount: number;           // Per-item discount in yuan (元)
  quantity: number;
}
```

**Indexes:**
- `_id` (default) — unique, same as `order_id`
- `user_id` — for querying orders by user
- `order_status` — for filtering by status

**Validation Rules:**
- `order_status` must be a valid `OrderStatus` value
- `total_amount` must equal sum of (price × quantity) for all items
- `discount_amount` must equal sum of (discount × quantity) for all items
- `wallet_deduct` must be >= 0 and <= wallet balance

## Collection: `wallets`

```typescript
interface WalletDocument {
  _id: string;               // UUID auto-generated
  user_id: string;            // openid (unique index)
  balance: number;            // Current balance in yuan (元)
  total_recharged: number;    // Cumulative recharged amount in yuan (元)
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}
```

**Indexes:**
- `user_id` — unique, for looking up wallet by user

**Validation Rules:**
- `balance` >= 0 (floor at 0)
- `total_recharged` >= 0 (floor at 0)
- One wallet document per user
- Member determination: `total_recharged > 0` means the user is a member

## Collection: `credits` (DEPRECATED)

This collection is no longer used. Retained for historical data only. Use `wallets` instead.

```typescript
interface CreditsDocument {
  _id: string;               // Auto-generated
  users_id: string;           // openid of the user
  total_scores: number;       // Cumulative earned points
  available_scores: number;   // Currently spendable points
}
```

## Collection: `categoried`

```typescript
interface CategoriedDocument {
  _id: string;               // Original numeric ID as string (e.g. "1", "2")
  name: string;               // Category name (unique)
  icon: string;               // WeChat Cloud fileID for inactive icon
  active_icon: string;        // WeChat Cloud fileID for active icon
  sort_order: number;         // Display order (default 0)
  status: boolean;            // true = visible
}
```

**Indexes:**
- `_id` (default) — unique, same as original numeric ID
- `name` — unique
- `sort_order` — for ordered display

**Notes:**
- `_id` preserves the original numeric ID as a string, matching `Products.categoried_id` references.

## Transaction Constraints

- WeChat Cloud Database transactions support `doc(id).get/update/set` and `collection.add()`
- Transactions do NOT support `where()` queries inside the transaction
- Maximum 100 operations per transaction
- 30-second timeout per transaction
- Read operations outside transaction, write operations inside transaction

## Security Rules (Client-Side Permissions)

Configure in WeChat Cloud Console for each collection:

| Collection | `read` | `write` | Notes |
|---|---|---|---|
| `products` | `true` | `false` | Client reads product catalog |
| `categoried` | `true` | `false` | Client reads category list |
| `users` | `false` | `false` | Cloud function only (admin access) |
| `orders` | `false` | `false` | Cloud function only (admin access) |
| `wallets` | `false` | `false` | Cloud function only (admin access) |

All cloud functions use `cloud.database()` which bypasses client-side security rules and has admin access to all collections.
```

- [ ] **Step 2: Commit**

```bash
git add weixin-cloud/database-schema.md
git commit -m "docs(db): update schema doc for wallet system"
```

---

## Task 9: Simplify useUserLevel Composable

**Files:**
- Modify: `src/composables/useUserLevel.ts`

> **Note:** User already simplified this from 4-level to 2-level. Now we change the signature from `level: string` to `isVip: boolean`.

- [ ] **Step 1: Replace useUserLevel with boolean-based version**

Current state (`1d7b63b`): function accepts `level: string` key, looks up `LEVEL_CONFIG[level]`.
New: function accepts `isVip: boolean`, returns VIP or REGULAR config directly.

```typescript
interface LevelConfig {
   tier: 'normal' | 'vip';
   isVip: boolean;
   color: string;
   lightBg: string;
   gradientBg: string;
   shadow: string;
   bannerGradient: string;
   pageBg: string;
   serviceGradient: string;
   badgeGradient: string;
   displayLabel: string;
   badgeTextColor: string;
}

const VIP_CONFIG: LevelConfig = {
   tier: 'vip',
   isVip: true,
   color: '#A16207',
   lightBg: 'rgba(161, 98, 7, 0.10)',
   gradientBg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
   shadow: '0 4rpx 28rpx rgba(161, 98, 7, 0.18)',
   bannerGradient:
      'linear-gradient(180deg, #92400E 0%, #B45309 15%, #D97706 35%, #F59E0B 55%, #FCD34D 75%, #FFFBEB 100%)',
   pageBg: '#FFFEF5',
   serviceGradient: 'linear-gradient(to right, #A16207, #D97706)',
   badgeGradient: 'linear-gradient(135deg, #92400E, #B45309 40%, #D97706 70%, #F59E0B)',
   displayLabel: '会员用户',
   badgeTextColor: '#ffffff',
};

const REGULAR_CONFIG: LevelConfig = {
   tier: 'normal',
   isVip: false,
   color: '#E8873A',
   lightBg: 'rgba(232, 135, 58, 0.06)',
   gradientBg: 'linear-gradient(135deg, #FFF8F2, #FEF0E2)',
   shadow: '0 2rpx 12rpx rgba(232, 135, 58, 0.08)',
   bannerGradient: 'linear-gradient(180deg, #FBBF7E 0%, #FDD9A8 30%, #FEF0E2 60%, #FFF8F2 100%)',
   pageBg: '#FFFAF6',
   serviceGradient: 'linear-gradient(to right, #ee862b, #f59e0b)',
   badgeGradient: 'rgba(232, 135, 58, 0.1)',
   displayLabel: '普通用户',
   badgeTextColor: '#C06A20',
};

export function useUserLevel(isVip: boolean): LevelConfig {
   return isVip ? VIP_CONFIG : REGULAR_CONFIG;
}
```

> The color values are taken directly from the user's existing 2-level configs at `1d7b63b`.

- [ ] **Step 2: Commit**

```bash
git add src/composables/useUserLevel.ts
git commit -m "refactor(composable): change useUserLevel signature from level string to isVip boolean"
```

---

## Task 10: Update Frontend API Layer

**Files:**
- Modify: `src/api/userApi.ts`
- Modify: `src/api/orderApi.ts`

- [ ] **Step 1: Update userApi.ts — replace Credits with Wallet, add recharge**

Current state (`1d7b63b`) uses `Credits`. Replace with `Wallets`:

```typescript
import type { Users, Wallets } from '@/types';

export interface UserProfile {
   user: Users;
   wallet: Wallets | null;
}

export interface CloudLoginResult {
   success: boolean;
   message: string;
   data?: {
      user: Users;
      wallet: Wallets;
      isNewUser: boolean;
   };
}

export async function cloudLogin(): Promise<CloudLoginResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'user-login', timeout: 10000 });
      return res.result as CloudLoginResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '登录失败',
      };
   }
}

export async function getCloudProfile(): Promise<UserProfile | null> {
   try {
      const res = await wx.cloud.callFunction({ name: 'get-profile' });
      const result = res.result as {
         success: boolean;
         data?: { user: Users; wallet: Wallets };
         message: string;
      };
      if (result.success && result.data) {
         return { user: result.data.user, wallet: result.data.wallet ?? null };
      }
      return null;
   } catch {
      return null;
   }
}

export interface UpdateProfileParams {
   name?: string;
   phone?: string;
   [key: string]: unknown;
}

export interface UpdateProfileResult {
   success: boolean;
   message: string;
}

export async function updateCloudProfile(
   params: UpdateProfileParams,
): Promise<UpdateProfileResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'update-profile', data: params });
      return res.result as UpdateProfileResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '更新失败',
      };
   }
}

export interface RechargeResult {
   success: boolean;
   message: string;
   data?: { wallet: Wallets };
}

export async function rechargeWallet(amount: number): Promise<RechargeResult> {
   try {
      const res = await wx.cloud.callFunction({ name: 'recharge', data: { amount } });
      return res.result as RechargeResult;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '充值失败',
      };
   }
}
```

- [ ] **Step 2: Update orderApi.ts — add walletDeduct to createOrder**

Current state (`1d7b63b`): `CreateOrderParams` does not have `walletDeduct`. Add it:

```typescript
interface CreateOrderParams {
   items: CartItemType[];
   totalAmount: number;
   discountAmount?: number;
   walletDeduct?: number;
}

export async function createOrder(params: CreateOrderParams): Promise<Orders> {
   const { items, totalAmount, discountAmount = 0, walletDeduct = 0 } = params;

   const oder_details: OrderDetailItem[] = items.map(item => ({
      product_id: item.product._id,
      product_name: item.product.name,
      product_image: item.product.images.split('&')[0] || '',
      specs: item.selectedSpecs,
      price: item.product.price,
      discount: item.product.discount,
      quantity: item.quantity,
   }));

   const res = await wx.cloud.callFunction({
      name: 'create-order',
      data: { items: oder_details, totalAmount, discountAmount, walletDeduct },
   });

   const result = res.result as { success: boolean; data?: { order_id: string }; message: string };
   if (!result.success) {
      throw new Error(result.message || '创建订单失败');
   }

   return { order_id: result.data!.order_id } as Orders;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/api/userApi.ts src/api/orderApi.ts
git commit -m "refactor(api): replace Credits with Wallet, add recharge and walletDeduct"
```

---

## Task 11: Update User Store

**Files:**
- Modify: `src/stores/modules/userStore.ts`

- [ ] **Step 1: Replace credits with wallet in userStore**

Current state (`1d7b63b`) uses `credits: Credits | null`. Replace:

```typescript
import { defineStore } from 'pinia';
import { cloudLogin, getCloudProfile, updateCloudProfile, rechargeWallet } from '@/api/userApi';
import type { UpdateProfileParams } from '@/api/userApi';
import type { Users, Wallets } from '@/types';

interface AuthState {
   openid: string;
   isLoggedIn: boolean;
   isLoading: boolean;
   cloudReady: boolean;
   user: Users | null;
   wallet: Wallets | null;
}

interface LoginResult {
   success: boolean;
   message: string;
   isNewUser?: boolean;
}

export const useUserStore = defineStore('user', {
   state: (): AuthState => ({
      openid: '',
      isLoggedIn: false,
      isLoading: false,
      cloudReady: false,
      user: null,
      wallet: null,
   }),

   getters: {
      isAuthenticated: state => state.isLoggedIn,
      isVip: state => (state.wallet?.total_recharged ?? 0) > 0,
   },

   actions: {
      async init(): Promise<void> {
         this.cloudReady = true;
         await this.login();
      },

      async login(): Promise<LoginResult> {
         this.isLoading = true;
         try {
            const result = await cloudLogin();
            if (!result.success) {
               return { success: false, message: result.message };
            }

            const { user, wallet, isNewUser } = result.data!;
            this.user = user;
            this.wallet = wallet;
            this.openid = user._id;
            this.isLoggedIn = true;

            return { success: true, message: result.message, isNewUser };
         } catch (error) {
            return {
               success: false,
               message: error instanceof Error ? error.message : '登录失败',
            };
         } finally {
            this.isLoading = false;
         }
      },

      logout(): void {
         this.openid = '';
         this.isLoggedIn = false;
         this.user = null;
         this.wallet = null;
      },

      async fetchProfile(): Promise<void> {
         const profile = await getCloudProfile();
         if (profile) {
            this.user = profile.user;
            this.wallet = profile.wallet;
         }
      },

      async updateUserProfile(
         params: UpdateProfileParams,
      ): Promise<{ success: boolean; message: string }> {
         const result = await updateCloudProfile(params);
         if (result.success && this.user) {
            this.user = {
               ...this.user,
               ...(params.name !== undefined ? { name: params.name } : {}),
               ...(params.phone !== undefined ? { phone: params.phone } : {}),
            };
         }
         return result;
      },

      async recharge(amount: number): Promise<{ success: boolean; message: string }> {
         const result = await rechargeWallet(amount);
         if (result.success && result.data) {
            this.wallet = result.data.wallet as Wallets;
         }
         return result;
      },
   },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/modules/userStore.ts
git commit -m "refactor(store): replace credits with wallet, add isVip getter and recharge action"
```

---

## Task 12: Update Profile Components

**Files:**
- Modify: `src/components/profile/StatsCard.vue`
- Modify: `src/components/profile/UserCard.vue`
- Modify: `src/components/profile/MenuList.vue`

> **Note:** User already updated these to 2-level visual. Now we change props from `level: string` to `isVip: boolean`.

- [ ] **Step 1: Update StatsCard — props `points` + `level` → `balance` + `isVip`**

Current state (`1d7b63b`): accepts `points: number` and `level?: string`, uses `formatPoints`.
Change to: accepts `balance: number` and `isVip: boolean`, uses `formatPrice`, emits `click:balance`.

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { formatPrice } from '@/utils/format';
import { useUserLevel } from '@/composables/useUserLevel';

interface Props {
   balance: number;
   isVip: boolean;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.isVip));

const emit = defineEmits<{
   'click:balance': [];
}>();
</script>

<template>
   <view
      class="stats-container"
      :style="{
         borderColor: levelConfig.color,
         ...(levelConfig.isVip ? { boxShadow: `0 2rpx 16rpx ${levelConfig.lightBg}` } : {}),
      }"
   >
      <view class="stat-item" @click="emit('click:balance')">
         <text class="stat-label">我的余额</text>
         <view class="stat-value-row">
            <text
               class="stat-value"
               :style="levelConfig.color ? { color: levelConfig.color } : {}"
               >{{ formatPrice(balance) }}</text
            >
            <text class="stat-unit">元</text>
         </view>
      </view>
   </view>
</template>
```

Styles remain the same as current state.

- [ ] **Step 2: Update UserCard — accept `isVip` prop**

Current state (`1d7b63b`): reads `props.user.level` for `useUserLevel`.
Change to: accepts `isVip: boolean` prop directly.

```vue
<script setup lang="ts">
import type { Users } from '@/types';
import { computed } from 'vue';
import { useUserLevel } from '@/composables/useUserLevel';

const DEFAULT_AVATAR = '/static/images/avatar.png';

interface Props {
   user: Users;
   isVip: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
   (e: 'click'): void;
}>();

const levelConfig = computed(() => useUserLevel(props.isVip));
</script>
```

Template and styles remain the same (they already use `levelConfig.*`).

- [ ] **Step 3: Update MenuList — accept `isVip` prop**

Current state (`1d7b63b`): accepts `level?: string`.
Change to: accepts `isVip: boolean`.

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useUserLevel } from '@/composables/useUserLevel';

const MENU_ICONS = '/static/icons/menu';

interface MenuItem {
   key: string;
   icon: string;
   label: string;
}

interface Props {
   isVip: boolean;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.isVip));
```

Rest of the component remains the same.

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/
git commit -m "refactor(components): update profile components to use isVip boolean"
```

---

## Task 13: Update Profile Page

**Files:**
- Modify: `src/pages/profile/index.vue`

- [ ] **Step 1: Update profile page to use wallet and isVip**

Current state (`1d7b63b`): uses `userProfile.level` for level config, `credits?.available_scores` for display.
Change to: derive `isVip` from `userStore.isVip`, use `wallet.balance`.

Replace the `<script setup>` section:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { useUserLevel } from '@/composables/useUserLevel';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import UserCard from '@/components/profile/UserCard.vue';
import StatsCard from '@/components/profile/StatsCard.vue';
import MenuList from '@/components/profile/MenuList.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();
const userProfile = computed(() => userStore.user);
const wallet = computed(() => userStore.wallet);
const isVip = computed(() => userStore.isVip);

const levelConfig = computed(() => useUserLevel(isVip.value));

onShow(() => {
   userStore.fetchProfile();
});

function handleBalanceClick(): void {
   uni.navigateTo({ url: '/pages/wallet/index' });
}

function handleMenuClick(_key: string): void {
   // TODO: Implement menu navigation
}

function handleUserCardClick(): void {
   uni.navigateTo({ url: '/pages/profile/edit' });
}
</script>
```

Update the template — replace component props:

```html
<!-- UserCard: pass isVip instead of relying on user.level -->
<UserCard :user="userProfile" :is-vip="isVip" @click="handleUserCardClick" />

<!-- Loading state UserCard -->
<UserCard
   :user="{ _id: '', name: '加载中...', id: '--', created_at: '' }"
   :is-vip="false"
/>

<!-- StatsCard: pass balance + isVip -->
<StatsCard
   :balance="wallet?.balance ?? 0"
   :is-vip="isVip"
   @click:balance="handleBalanceClick"
/>

<!-- MenuList: pass isVip -->
<MenuList :is-vip="isVip" @click="handleMenuClick" />
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/profile/index.vue
git commit -m "refactor(profile): use wallet balance and isVip in profile page"
```

---

## Task 14: Create Wallet Page

**Files:**
- Create: `src/pages/wallet/index.vue`
- Modify: `src/pages.json`

- [ ] **Step 1: Create wallet page**

Create `src/pages/wallet/index.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { useUserLevel } from '@/composables/useUserLevel';
import { formatPrice } from '@/utils/format';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();

const wallet = computed(() => userStore.wallet);
const isVip = computed(() => userStore.isVip);
const levelConfig = computed(() => useUserLevel(isVip.value));

const PRESET_AMOUNTS = [20, 30, 50];
const selectedAmount = ref<number | null>(null);
const customAmount = ref('');
const isRecharging = ref(false);

const displayBalance = computed(() => formatPrice(wallet.value?.balance ?? 0));

function selectAmount(amount: number): void {
   selectedAmount.value = amount;
   customAmount.value = '';
}

function onCustomInput(e: { detail: { value: string } }): void {
   customAmount.value = e.detail.value;
   selectedAmount.value = null;
}

const rechargeAmount = computed(() => {
   if (selectedAmount.value) return selectedAmount.value;
   const parsed = parseFloat(customAmount.value);
   return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
});

async function handleRecharge(): Promise<void> {
   if (rechargeAmount.value <= 0 || isRecharging.value) return;

   isRecharging.value = true;
   try {
      const result = await userStore.recharge(rechargeAmount.value);
      if (result.success) {
         uni.showToast({ title: '充值成功', icon: 'success' });
         selectedAmount.value = null;
         customAmount.value = '';
      } else {
         uni.showToast({ title: result.message, icon: 'none' });
      }
   } catch {
      uni.showToast({ title: '充值失败', icon: 'none' });
   } finally {
      isRecharging.value = false;
   }
}
</script>

<template>
   <view class="wallet-page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="我的余额" :show-back="true" />

      <view class="page-content" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
         <view
            class="balance-card"
            :style="{
               borderColor: levelConfig.color,
               ...(levelConfig.isVip ? { background: levelConfig.gradientBg } : {}),
            }"
         >
            <text class="balance-label">当前余额</text>
            <view class="balance-row">
               <text
                  class="balance-value"
                  :style="levelConfig.color ? { color: levelConfig.color } : {}"
                  >{{ displayBalance }}</text
               >
               <text class="balance-unit">元</text>
            </view>
            <view v-if="levelConfig.isVip" class="member-badge" :style="{ background: levelConfig.badgeGradient }">
               <text class="member-text" :style="{ color: levelConfig.badgeTextColor }">{{ levelConfig.displayLabel }}</text>
            </view>
            <text v-else class="regular-label">{{ levelConfig.displayLabel }}</text>
         </view>

         <view class="recharge-section">
            <text class="section-title">充值金额</text>

            <view class="preset-grid">
               <view
                  v-for="amount in PRESET_AMOUNTS"
                  :key="amount"
                  class="preset-btn"
                  :class="{ active: selectedAmount === amount }"
                  @click="selectAmount(amount)"
               >
                  <text class="preset-text">{{ amount }}元</text>
               </view>
            </view>

            <view class="custom-input-wrap">
               <text class="custom-label">自定义金额</text>
               <input
                  class="custom-input"
                  type="digit"
                  placeholder="请输入金额"
                  :value="customAmount"
                  @input="onCustomInput"
               />
            </view>

            <view
               class="recharge-btn"
               :class="{ disabled: rechargeAmount <= 0 || isRecharging }"
               @click="handleRecharge"
            >
               <text class="recharge-text">{{ isRecharging ? '充值中...' : '充值' }}</text>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.wallet-page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

.page-content {
   display: flex;
   flex-direction: column;
   padding: 32rpx;
   gap: 32rpx;
}

.balance-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   border: 2rpx solid transparent;
   padding: 40rpx 32rpx;
   box-shadow: $shadow-card;
}

.balance-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.balance-row {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
   margin-top: 12rpx;
}

.balance-value {
   font-size: 64rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 80rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.balance-unit {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
}

.member-badge {
   align-self: flex-start;
   border-radius: $radius-full;
   padding: 6rpx 20rpx;
   margin-top: 16rpx;
}

.member-text {
   font-size: 22rpx;
   font-weight: 600;
   line-height: 30rpx;
   text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

.regular-label {
   font-size: 24rpx;
   color: $text-muted;
   margin-top: 16rpx;
}

.recharge-section {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 32rpx;
   box-shadow: $shadow-card;
}

.section-title {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 44rpx;
}

.preset-grid {
   display: flex;
   gap: 24rpx;
   margin-top: 24rpx;
}

.preset-btn {
   flex: 1;
   padding: 24rpx 0;
   background-color: $bg-page;
   border-radius: $radius-md;
   border: 2rpx solid $border-default;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s ease;

   &.active {
      background-color: rgba(238, 134, 43, 0.1);
      border-color: $brand-primary;
   }
}

.preset-text {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;

   .active & {
      color: $brand-primary;
   }
}

.custom-input-wrap {
   margin-top: 24rpx;
}

.custom-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.custom-input {
   margin-top: 12rpx;
   padding: 24rpx;
   background-color: $bg-page;
   border-radius: $radius-md;
   border: 2rpx solid $border-default;
   font-size: 28rpx;
   color: $text-primary;
}

.recharge-btn {
   margin-top: 32rpx;
   padding: 24rpx;
   background-color: $brand-primary;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;

   &.disabled {
      opacity: 0.5;
   }
}

.recharge-text {
   font-size: 30rpx;
   font-weight: 600;
   color: $uni-text-color-inverse;
   line-height: 42rpx;
}
</style>
```

- [ ] **Step 2: Update pages.json — add wallet, remove points**

In `src/pages.json`, remove the `pages/points/index` entry and add `pages/wallet/index` in its place.

- [ ] **Step 3: Commit**

```bash
git add src/pages/wallet/ src/pages.json
git commit -m "feat(wallet): add wallet balance page with recharge"
```

---

## Task 15: Update Cart Page with Wallet Deduction

**Files:**
- Modify: `src/pages/cart/index.vue`

- [ ] **Step 1: Update script setup — add wallet imports and logic**

Current state (`1d7b63b`) already imports `useUserStore`. Add `computed` to vue import, wallet refs, and update `handleCheckout`.

Replace line 2 (add `computed`):

```typescript
import { ref, computed } from 'vue';
```

Add after line 15 (`const submitting = ref(false);`):

```typescript
const useWallet = ref(false);

const wallet = computed(() => userStore.wallet);
const maxDeduct = computed(() => {
   if (!useWallet.value || !wallet.value) return 0;
   return Math.min(wallet.value.balance, cartStore.totalAmount);
});
```

Replace `handleCheckout` function (lines 25-58) — add `walletDeduct` and reset `useWallet`:

```typescript
const handleCheckout = async () => {
   if (cartItems.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' });
      return;
   }

   if (!userStore.isAuthenticated) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
   }

   submitting.value = true;
   try {
      const order = await createOrder({
         items: cartItems,
         totalAmount: cartStore.originalAmount,
         discountAmount: cartStore.totalDiscount,
         walletDeduct: maxDeduct.value,
      });

      cartStore.clearCart();
      useWallet.value = false;
      userStore.fetchProfile();

      uni.redirectTo({
         url: `/pages/order/detail?id=${order.order_id}`,
      });
   } catch (err) {
      uni.showToast({
         title: err instanceof Error ? err.message : '下单失败',
         icon: 'none',
      });
   } finally {
      submitting.value = false;
   }
};
```

- [ ] **Step 2: Update template — add wallet deduction UI in bottom bar**

Replace the bottom bar section (lines 108-120). Insert the wallet deduction row between total-info and checkout-btn:

```html
<view v-if="cartItems.length > 0" class="bottom-bar">
   <view class="total-info">
      <text class="total-label">合计</text>
      <text class="total-amount">{{ formatPriceDisplay(cartStore.totalAmount) }}</text>
   </view>

   <view v-if="wallet && wallet.balance > 0" class="wallet-deduct" @click="useWallet = !useWallet">
      <view class="checkbox" :class="{ checked: useWallet }">
         <text v-if="useWallet" class="check-mark">✓</text>
      </view>
      <text class="deduct-text">使用余额抵扣 ¥{{ formatPriceDisplay(maxDeduct) }}</text>
   </view>

   <view
      class="checkout-btn"
      :class="{ disabled: submitting }"
      @click="!submitting && handleCheckout()"
   >
      <text class="checkout-text">{{ submitting ? '下单中...' : '去结算' }}</text>
   </view>
</view>
```

- [ ] **Step 3: Add wallet deduction styles**

Append these styles before the closing `</style>` tag, after the `.checkout-text` rule:

```scss
.wallet-deduct {
   display: flex;
   align-items: center;
   gap: 12rpx;
   padding: 8rpx 0;
}

.checkbox {
   width: 36rpx;
   height: 36rpx;
   border-radius: 50%;
   border: 2rpx solid $border-default;
   display: flex;
   align-items: center;
   justify-content: center;

   &.checked {
      background-color: $brand-primary;
      border-color: $brand-primary;
   }
}

.check-mark {
   font-size: 20rpx;
   color: $uni-text-color-inverse;
   line-height: 1;
}

.deduct-text {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/cart/index.vue
git commit -m "feat(cart): add wallet deduction option at checkout"
```

---

## Task 16: Update Format Utility

---

## Task 16: Update Format Utility

**Files:**
- Modify: `src/utils/format.ts`

- [ ] **Step 1: Replace formatPoints with formatBalance**

Current state (`1d7b63b`): has `formatPoints(points: number)`.
Change to `formatBalance(balance: number)`:

```typescript
/** 格式化余额，超过 1 万以"万"为单位 */
export function formatBalance(balance: number): string {
   if (balance >= 10000) {
      return `${(balance / 10000).toFixed(1)}万`;
   }
   return balance % 1 === 0 ? balance.toString() : balance.toFixed(2);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/format.ts
git commit -m "refactor(utils): rename formatPoints to formatBalance"
```

---

## Task 17: Delete Legacy Points Files

**Files:**
- Delete: `src/pages/points/index.vue`
- Delete: `src/components/points/PointsCard.vue`
- Delete: `src/components/points/RewardCard.vue`
- Delete: `src/mock/user.ts`
- Delete: `src/mock/index.ts`

- [ ] **Step 1: Delete all points-related files**

```bash
rm -rf src/pages/points/
rm -rf src/components/points/
rm -rf src/mock/
```

- [ ] **Step 2: Verify build still works**

Run: `npx vitest run`
Expected: All tests pass (no remaining references to deleted modules)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove legacy points mall page, components, and mock data"
```

---

## Task 18: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run linter**

Run: `npx eslint "src/**/*.{js,ts,vue}"`
Expected: No errors

- [ ] **Step 3: Run type check**

Run: `npx vue-tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Build check**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve lint/type/build issues from wallet migration"
```

---

## Spec Coverage Checklist

| Spec Requirement | Task | Status |
|---|---|---|
| New `wallets` collection | Task 2 (wallet.ts), Task 4 (recharge), Task 7 (user-login) | TODO |
| `users` remove `level` | Task 1 (types), Task 7 (user-login) | TODO |
| `orders` add `wallet_deduct` | Task 1 (types), Task 5 (create-order) | TODO |
| Deprecate `credits` | Task 3 (cleanup), Task 7 (migration) | TODO |
| New `recharge` cloud function | Task 4 | TODO |
| Modified `create-order` | Task 5 | TODO |
| Modified `cancel-order` | Task 6 | TODO |
| Modified `user-login` | Task 7 | TODO |
| Modified `get-profile` | Task 7 | TODO |
| Delete `utils/credits.ts` | Task 3 | TODO |
| Simplify `database.ts` | Task 3 | TODO |
| New wallet page | Task 14 | TODO |
| `useUserLevel(level)` → `useUserLevel(isVip)` | Task 9 | TODO |
| Update `userStore` | Task 11 | TODO |
| Update `StatsCard` | Task 12 | TODO |
| Update `UserCard` | Task 12 | TODO |
| Update `MenuList` | Task 12 | TODO |
| Update profile page | Task 13 | TODO |
| Order flow wallet deduction | Task 15 | TODO |
| Remove points page/components | Task 17 | TODO |
| Remove mock data | Task 17 | TODO |
| Update `pages.json` | Task 14 | TODO |
| Update `database-schema.md` | Task 8 | TODO |
| Rename `formatPoints` → `formatBalance` | Task 16 | TODO |
