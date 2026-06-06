# WeChat Cloud Database Schema

## Collections Overview

| Collection   | `_id` Strategy               | Client Access | Cloud Function Access |
| ------------ | ---------------------------- | ------------- | --------------------- |
| `users`      | `openid` (string)            | None          | Admin                 |
| `products`   | Original numeric ID (string) | Read-only     | Admin                 |
| `orders`     | `order_id` (string)          | None          | Admin                 |
| `wallets`    | UUID (string)                | None          | Admin                 |
| `categoried` | Original numeric ID (string) | Read-only     | Admin                 |
| `admins`     | Auto-generated               | None          | Admin                 |
| `vip_cards`  | Auto-generated               | None          | Admin                 |

## Collection: `users`

```typescript
interface UserDocument {
   _id: string; // openid (WeChat unique user ID)
   name: string; // User display name
   id: string; // 唯一7位用户ID (7-digit display ID)
   created_at: string; // ISO timestamp
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
   _id: string; // Original numeric ID as string (e.g. "1", "2")
   categoried_id: string | number; // Category reference ID (client normalizes before comparing)
   name: string;
   description: string;
   price: number; // Unit: cents (分)
   images: string; // Storage paths (e.g. product-imgs/q1.png) joined by "&"
   specs: ProductSpecs | string; // JSON object, or JSON string in migrated data
   status: boolean; // true = on shelf, false = off shelf
}
```

**Indexes:**

- `_id` (default) — used in cloud function transactions via `doc(id).get()`
- `categoried_id` — for filtering by category

**Notes:**

- `_id` MUST preserve the original numeric ID. Cloud functions use `doc(id).get()` inside transactions which requires the exact `_id`.
- `images` stores stable storage paths or cloud fileIDs separated by `&`. Frontend helpers prepend the cloud storage prefix when needed.
- `specs` and `categoried_id` are the only canonical product fields used by clients and cloud-function writes.
- Historical `specifications` is ignored and never rendered. Product list APIs omit old fields, and `admin-products.update` removes them.

## Collection: `orders`

```typescript
interface OrderDocument {
   _id: string; // Same as order_id (atomic uniqueness via doc ID)
   order_id: string; // Generated unique order ID
   user_id: string; // openid of the order owner
   order_status: string; // 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
   total_amount: number; // Pre-discount total in yuan (元)
   discount_amount: number; // Total discount in yuan (元)
   wallet_deduct: number; // Balance deduction amount in yuan (元), default 0
   created_at: string; // ISO timestamp
   oder_details: OrderDetailItem[]; // Note: historical typo preserved
}

interface OrderDetailItem {
   product_id: string;
   product_name: string;
   product_image: string; // WeChat Cloud fileID
   specs: Record<string, string>;
   price: number; // Unit price with spec surcharge in yuan (元)
   discount: number; // Per-item discount in yuan (元)
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
- `wallet_deduct` must be >= 0, <= wallet balance, and <= (total_amount - discount_amount)

## Collection: `wallets`

```typescript
interface WalletDocument {
   _id: string; // UUID auto-generated
   user_id: string; // openid (unique index)
   balance: number; // Current balance in yuan (元)
   total_recharged: number; // Cumulative recharged amount in yuan (元)
   created_at: string; // ISO timestamp
   updated_at: string; // ISO timestamp
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
   _id: string; // Auto-generated
   users_id: string; // openid of the user
   total_scores: number; // Cumulative earned points
   available_scores: number; // Currently spendable points
}
```

## Collection: `categoried`

```typescript
interface CategoriedDocument {
   _id: string; // Original numeric ID as string (e.g. "1", "2")
   name: string; // Category name (unique)
   icon: string; // WeChat Cloud fileID for inactive icon
   active_icon: string; // WeChat Cloud fileID for active icon
   sort_order: number; // Display order (default 0)
   status: boolean; // true = visible
}
```

**Indexes:**

- `_id` (default) — unique, same as original numeric ID
- `name` — unique
- `sort_order` — for ordered display

**Notes:**

- `_id` preserves the original numeric ID as a string, matching `Products.categoried_id` references.

## Collection: `admins`

```typescript
interface AdminDocument {
   _id: string; // Auto-generated
   username: string; // Admin login username
   password: string; // Admin login password (plain text)
   authorized_openids: string[]; // WeChat openids allowed to call management cloud functions
}
```

**Indexes:**

- `username` — for login lookup
- `authorized_openids` — for management cloud function authorization

**Validation Rules:**

- `username` must be non-empty and unique
- `password` must be non-empty
- `authorized_openids` is an array of WeChat openids; management cloud functions (`admin-products`, `admin-vip-cards`) verify the caller's `adminOpenId` against this field

**Notes:**

- `authorized_openids` is required for management cloud function authorization. Add the admin app's `VITE_ADMIN_OPENID` value to this array to grant access.
- The `admin-login` cloud function only checks `username`/`password`. The new management cloud functions check `authorized_openids` for API-level authorization.

## Collection: `vip_cards`

```typescript
interface VipCardDocument {
   _id: string; // Auto-generated
   card_no: string; // Unique card number (format: VC + 10 alphanumeric chars)
   amount: number; // Card face value in yuan (元)
   status: string; // 'active' | 'used' | 'disabled'
   created_at: string; // ISO timestamp
   used_by?: string; // openid of the user who redeemed the card
   used_at?: string; // ISO timestamp of redemption
   disabled_at?: string; // ISO timestamp when admin disabled the card
}
```

**Indexes:**

- `card_no` — unique, for redemption lookup and collision detection
- `status` — for filtering by lifecycle state

**Validation Rules:**

- `card_no` must be globally unique
- `status` transitions: `active → used` (redemption) or `active → disabled` (admin action)
- `used` and `disabled` cards are immutable
- Amount must be a positive number

**Notes:**

- Card numbers are generated server-side by `admin-vip-cards` cloud function.
- Default batch quantity is 5, maximum 50 per issuance.
- Batch insertion is all-or-nothing via transaction.

## Transaction Constraints

- WeChat Cloud Database transactions support `doc(id).get/update/set` and `collection.add()`
- Transactions do NOT support `where()` queries inside the transaction
- Maximum 100 operations per transaction
- 30-second timeout per transaction
- Read operations outside transaction, write operations inside transaction

## Security Rules (Client-Side Permissions)

Configure in WeChat Cloud Console for each collection:

| Collection   | `read`  | `write` | Notes                                         |
| ------------ | ------- | ------- | --------------------------------------------- |
| `products`   | `true`  | `false` | Client reads product catalog                  |
| `categoried` | `true`  | `false` | Client reads category list                    |
| `users`      | `false` | `false` | Cloud function only (admin access)            |
| `orders`     | `false` | `false` | Cloud function only (admin access)            |
| `wallets`    | `false` | `false` | Cloud function only (admin access)            |
| `admins`     | `false` | `false` | Cloud function only (login + auth check)      |
| `vip_cards`  | `false` | `false` | Cloud function only (redemption + management) |

All cloud functions use `cloud.database()` which bypasses client-side security rules and has admin access to all collections.
