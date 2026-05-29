# Wallet Balance System Design

> **Base commit:** `1d7b63b` (includes user-simplified 2-level tier refactor)
> **Previous base:** `a14e996` (superseded — user manually completed partial work)

Replace the legacy points/credits system with a wallet-based balance system. Users can recharge their wallet and use balance to deduct from order payments.

## Motivation

The current points system (credits table, tiered levels based on accumulated points, points mall page) is no longer needed. The business model simplifies to: users who have recharged are members, others are regular users. Balance is real monetary value stored in a wallet.

## Already Completed (by user, in `1d7b63b`)

The following changes were done by the user between `a14e996` and `1d7b63b`:

- `useUserLevel` composable simplified from 4-level to 2-level config (普通用户 / 会员用户)
- Profile components (UserCard, StatsCard, MenuList) updated to use the 2-level visual style
- Profile page adapted to 2-level tiers
- `Users.level` field still exists but now only has 2 values
- Avatar image updated, prettier formatting applied
- Tests partially updated (credits.test.ts, database.test.ts)

**These are NOT re-done in this plan.** They are the starting point.

## Data Layer

### New `wallets` Collection

```typescript
interface WalletDocument {
  _id: string;              // UUID auto-generated
  user_id: string;          // openid (unique index)
  balance: number;          // Current balance in yuan
  total_recharged: number;  // Cumulative recharged amount in yuan
  created_at: string;       // ISO timestamp
  updated_at: string;       // ISO timestamp
}
```

- Index: `user_id` (unique) — for looking up wallet by user
- Member determination: `total_recharged > 0` means the user is a member

### `users` Collection Changes

- Remove `level` field — member status derived from wallets table
- New user registration no longer sets `level`

### `orders` Collection Changes

- Add `wallet_deduct: number` field — amount of balance used for this order (yuan)

### `credits` Collection

Deprecated. Old data retained but no longer read or written.

## Cloud Functions

### New: `recharge`

Simulated recharge (no real payment yet).

**Input:** `{ amount: number }`

**Logic:**
1. Validate amount > 0
2. Find or create wallet for user
3. `wallet.balance += amount`, `wallet.total_recharged += amount`
4. Return updated wallet

### Modified: `create-order`

**New input field:** `walletDeduct: number` (default 0)

**Changes:**
1. Validate products and prices (unchanged)
2. Validate `walletDeduct <= wallet.balance` and `walletDeduct >= 0`
3. Create order with `wallet_deduct` field
4. Deduct wallet balance: `wallet.balance -= walletDeduct`
5. Remove all points logic: no `addPoints`, no `getUpdatedLevel`

### Modified: `cancel-order`

**Changes:**
1. Cancel order (unchanged)
2. Refund wallet balance: `wallet.balance += order.wallet_deduct`
3. Remove all points logic: no `subtractPoints`, no level downgrade

### Modified: `user-login`

**Changes:**
1. Create new user: also create wallet record (`balance: 0, total_recharged: 0`)
2. Return `wallet` instead of `credits`
3. Remove `level` from new user creation

### Modified: `get-profile`

**Changes:**
1. Query `wallets` table instead of `credits`
2. Return `wallet` instead of `credits`

### Deleted

- `utils/credits.ts` — entire file removed
- `utils/database.ts`: remove `LEVEL_THRESHOLDS`, `getLevelForScore`, `UserLevel` type, `isValidUserLevel`

## Frontend

### New Page: `pages/wallet/index.vue`

Balance page with:
- Header: "我的余额"
- Balance card showing current balance and member status
- Recharge area: preset amounts (20/30/50) + custom input + "充值" button
- Calls `recharge` cloud function

### Modified: `useUserLevel` composable

```typescript
// Before (current state at 1d7b63b): useUserLevel(level: string) → lookup from 2-level config
// After:  useUserLevel(isVip: boolean) → only two configs (regular / member)
```

Change the function signature from `level: string` to `isVip: boolean`. Keep existing color schemes (普通用户 and 会员用户 configs). Remove the string key lookup.

### Modified: `userStore`

- `credits: Credits | null` → `wallet: Wallet | null`
- `fetchProfile()` and `login()` populate `wallet` from API response
- New `recharge(amount: number)` action
- Add `isVip` getter: `(state.wallet?.total_recharged ?? 0) > 0`

### Modified: `StatsCard`

- Props: `points: number` + `level?: string` → `balance: number` + `isVip: boolean`
- Display `balance` instead of `credits.available_scores`
- Navigate to `/pages/wallet/index` instead of `/pages/points/index`
- Use `formatPrice` instead of `formatPoints`

### Modified: `UserCard` and `MenuList`

- Props: accept `isVip: boolean` instead of relying on `user.level` / `level?: string`
- Derive `useUserLevel(isVip)`

### Modified: Order flow

- At payment step, show balance deduction option **only when `wallet.balance > 0`**
- When balance is 0, the deduction area is not rendered at all
- User can choose to use balance (max deduction = min(balance, total))
- Actual payment = total - wallet deduction
- Pass `walletDeduct` to `create-order` cloud function

### Modified: Profile page

- Derive `isVip` from `userStore.isVip` instead of `userProfile.level`
- Pass `isVip` to child components instead of `level`
- Use `wallet.balance` instead of `credits.available_scores`

### Removed

- `pages/points/` directory — entire points mall page
- `components/points/` directory — PointsCard, RewardCard
- `mock/user.ts` and `mock/index.ts` — Reward type and hotRewards data
- `pages.json` entry for `pages/points/index`
- `types/db-scheme/` Credits type (keep file but mark deprecated)

### Added to `pages.json`

```json
{
  "path": "pages/wallet/index",
  "style": {
    "navigationStyle": "custom",
    "navigationBarTitleText": "我的余额"
  }
}
```

## Impact Summary

| Area | Change | Status |
|------|--------|--------|
| Database | New `wallets` table, modify `orders` (add wallet_deduct), deprecate `credits` | TODO |
| Cloud Functions | New `recharge`, modify 4 existing functions, delete `utils/credits.ts` | TODO |
| Frontend Pages | New `wallet/index`, remove `points/index` | TODO |
| Frontend Components | Remove `points/*`, modify `StatsCard`, `UserCard`, `MenuList` | Partially done (visual 2-level), needs isVip boolean adaptation |
| Frontend State | `userStore.credits` → `userStore.wallet` | TODO |
| Frontend Composables | `useUserLevel(level: string)` → `useUserLevel(isVip: boolean)` | Partially done (2-level config), needs boolean signature |
