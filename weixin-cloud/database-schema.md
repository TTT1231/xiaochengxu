# WeChat Cloud Database Schema

## Collections Overview

| Collection | `_id` Strategy | Client Access | Cloud Function Access |
|---|---|---|---|
| `users` | `openid` (string) | None | Admin |
| `products` | Original numeric ID (string) | Read-only | Admin |
| `orders` | `order_id` (string) | None | Admin |
| `credits` | Auto-generated | None | Admin |
| `categoried` | Original numeric ID (string) | Read-only | Admin |

## Collection: `users`

```typescript
interface UserDocument {
  _id: string;          // openid (WeChat unique user ID)
  name: string;         // User display name
  id: string;           // 唯一7位用户ID (7-digit display ID)
  level: string;        // '普通用户' | '会员用户'
  created_at: string;   // ISO timestamp
}
```

**Indexes:**
- `_id` (default) — unique, used for lookup by openid
- `id` — unique, used for display ID lookup

**Validation Rules:**
- `_id` must be non-empty string (openid)
- `id` must be unique 7-digit string
- `level` must be one of the 2 valid values

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

## Collection: `credits`

```typescript
interface CreditsDocument {
  _id: string;               // Auto-generated
  users_id: string;           // openid of the user
  total_scores: number;       // Cumulative earned points
  available_scores: number;   // Currently spendable points
}
```

**Indexes:**
- `users_id` — unique, for looking up credits by user

**Validation Rules:**
- `total_scores` >= 0 (floor at 0)
- `available_scores` >= 0 (floor at 0)
- One credits document per user

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
| `credits` | `false` | `false` | Cloud function only (admin access) |

All cloud functions use `cloud.database()` which bypasses client-side security rules and has admin access to all collections.
