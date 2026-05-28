## ADDED Requirements

### Requirement: Order creation via cloud function
The system SHALL create orders exclusively through a `create-order` cloud function. The client SHALL NOT directly write to the `orders` collection.

#### Scenario: Successful order creation
- **WHEN** the client calls `create-order` with items, total amount, and discount amount
- **THEN** the cloud function SHALL: (1) read product prices outside transaction via `doc(product_id).get()` to validate the total, (2) generate a server-side unique `order_id`, (3) run a transaction: create order document with `_id = order_id` (atomic uniqueness via document ID), update the user's credits (add points), and check/update the user's membership level

#### Scenario: Order total validation
- **WHEN** the client sends `total_amount` and `discount_amount`
- **THEN** the cloud function SHALL validate that `total_amount` equals the sum of (product.price × quantity) for all items (pre-discount amount), and that `discount_amount` equals the sum of (product.discount × quantity). Credits earned = `total_amount - discount_amount`.

#### Scenario: Cart size limit
- **WHEN** the order contains more than 20 items
- **THEN** the cloud function SHALL reject the order to stay within transaction operation limits (100 operations per transaction)

#### Scenario: Unique order ID generation
- **WHEN** the cloud function generates an order ID
- **THEN** it SHALL use `order_id` as the document `_id`. Uniqueness is guaranteed atomically by the database — inserting a document with a duplicate `_id` will fail, and the function can retry with a new ID.

#### Scenario: Product not found during validation
- **WHEN** a product ID in the order does not exist in the `products` collection
- **THEN** the cloud function SHALL reject the order with an error indicating invalid product

### Requirement: Order cancellation via cloud function
The system SHALL cancel orders exclusively through a `cancel-order` cloud function. The client SHALL NOT directly update the `orders` collection.

#### Scenario: Successful order cancellation
- **WHEN** the client calls `cancel-order` with an `order_id`
- **THEN** the cloud function SHALL verify the order belongs to the calling user (via `OPENID`), verify the order status allows cancellation (only `pending` or `preparing`), update the status to `cancelled`, deduct both `total_scores` AND `available_scores` from the user's credits (with floor at `0`), and check/update the membership level — all within a single database transaction

#### Scenario: Cancel already completed order
- **WHEN** the user tries to cancel a `completed` order
- **THEN** the cloud function SHALL reject the cancellation with an appropriate error message

#### Scenario: Cancel another user's order
- **WHEN** the calling user's `OPENID` does not match the order's `user_id`
- **THEN** the cloud function SHALL reject with a permission denied error

### Requirement: Credits and level update logic in cloud functions
The system SHALL implement credits calculation and membership level update logic within cloud functions, replacing the PostgreSQL triggers `handle_order_credits` and `update_user_level`.

#### Scenario: Credits added on order creation
- **WHEN** an order is created with `total_amount: 120` and `discount_amount: 10`
- **THEN** the user's `credits.total_scores` and `credits.available_scores` SHALL each increase by `110` (120 - 10)

#### Scenario: Credits deducted on order cancellation
- **WHEN** an order with `total_amount: 120` and `discount_amount: 10` is cancelled
- **THEN** the user's `credits.total_scores` and `credits.available_scores` SHALL each decrease by `110`, with a floor of `0` for both fields

#### Scenario: Credits semantics
- **WHEN** the system updates credits
- **THEN** `total_scores` represents cumulative earned points and `available_scores` represents currently spendable points. In the current business logic, both fields are always modified identically. Future features (e.g., points redemption) may deduct only `available_scores`.

#### Scenario: Level upgrade when credits reach threshold
- **WHEN** a user's `credits.total_scores` reaches 100
- **THEN** the user's `level` SHALL be updated to `黄铜会员`

#### Scenario: Level downgrade when credits drop below threshold
- **WHEN** a user's `credits.total_scores` drops from 120 to 80 due to order cancellation
- **THEN** the user's `level` SHALL be updated to `普通会员`

#### Scenario: Level thresholds
- **WHEN** the system checks membership level
- **THEN** the thresholds SHALL be: `≥300` → `黄金会员`, `≥200` → `白银会员`, `≥100` → `黄铜会员`, `<100` → `普通会员`

### Requirement: User login cloud function
The system SHALL provide a `user-login` cloud function that handles both new user registration and existing user login in a single function. No `wx.login()` is needed — the cloud function call inherently carries the user's OPENID.

#### Scenario: Login returns user profile
- **WHEN** the client calls `user-login`
- **THEN** the cloud function SHALL return the user record and credits record in a single response

### Requirement: Cloud functions run in WeChat Cloud environment
All cloud functions SHALL be deployed to the WeChat Cloud development environment. The build pipeline (`compileWeixinCloud()` Vite plugin) SHALL compile TypeScript cloud functions from `weixin-cloud/` to the output directory. The plugin MUST support recursive directory traversal to handle the `weixin-cloud/<function-name>/index.ts` structure.

#### Scenario: TypeScript cloud function compilation
- **WHEN** the project is built with `pnpm build:mp-weixin`
- **THEN** all `.ts` files in `weixin-cloud/` and its subdirectories SHALL be compiled to CommonJS `.js` files in `dist/dev/mp-weixin/weixin-cloud/<function-name>/index.js`

### Requirement: Cloud functions use database transactions for atomic operations
All cloud functions that modify multiple collections (orders + credits + users) SHALL use `db.runTransaction()` to ensure atomicity. Transactions SHALL respect CloudBase limits: `doc()` operations only (no `where()`), 100 operations max, 30-second timeout.

#### Scenario: Order creation transaction failure
- **WHEN** the credits update fails after the order document is created within a transaction
- **THEN** the entire transaction SHALL be rolled back, and no order or credits document SHALL be persisted

#### Scenario: Transaction operation limits
- **WHEN** a transaction is designed
- **THEN** read operations (product price validation, user lookup) SHALL be performed outside the transaction, and only write operations (create order, update credits, update level) SHALL be inside the transaction, keeping operation count within limits

### Requirement: Order query verifies ownership
The system SHALL verify that the requesting user owns any order they attempt to view in detail.

#### Scenario: User views own order
- **WHEN** the client calls `get-orders` to get a single order detail
- **THEN** the cloud function SHALL verify the order's `user_id` matches the caller's `OPENID`

#### Scenario: User attempts to view another user's order
- **WHEN** the caller's `OPENID` does not match the order's `user_id`
- **THEN** the cloud function SHALL return a "not found" error (not "permission denied", to avoid confirming order existence)
