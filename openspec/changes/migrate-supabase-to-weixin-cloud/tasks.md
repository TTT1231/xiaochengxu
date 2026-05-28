## 1. Database Schema & Types (G1)

- [x] 1.1 Define WeChat Cloud Database collection schemas: create `weixin-cloud/database-schema.md` documenting all 5 collections (users, products, orders, credits, categoried) with field types, indexes, and validation rules. Note: `products._id` must preserve original numeric ID (used by cloud function transaction `doc(id).get()`), `orders._id` = generated `order_id`, `users._id` = `openid`
- [x] 1.2 Update TypeScript types in `src/types/db-scheme/`: remove PostgreSQL-specific types, adjust `_id` to `string`, ensure compatibility with document model. Fix display ID comment from "唯一6位" to "唯一7位" to match actual implementation.
- [x] 1.3 Remove `supabaseClient.ts` and create `src/utils/cloudDatabase.ts` — WeChat Cloud Database client wrapper with read-only client-side instance
- [x] 1.4 Update `src/hooks/useEnvConfig.ts`: remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, remove Supabase config
- [x] 1.5 Update `vite.config.ts`: remove Supabase env vars from `define`, update `compileWeixinCloud()` plugin to recursively traverse subdirectories (currently skips directories with `if (!file.isFile()) continue`), output each cloud function as `weixin-cloud/<name>/index.js`
- [x] 1.6 Remove `supabase-wechat-stable-v2` from `package.json` dependencies
- [x] 1.7 Configure WeChat Cloud Database collection security rules: `products` and `categoried` = client read-only, `users`/`orders`/`credits` = client no access, all collections = cloud function admin access

## 2. Cloud Functions Core (G2)

- [ ] 2.1 Create `weixin-cloud/package.json` with `wx-server-sdk` dependency for cloud functions
- [ ] 2.2 Create `weixin-cloud/utils/database.ts`: shared database helpers (transaction wrapper with 30s timeout awareness, validation functions for order_status and user_level enums)
- [ ] 2.3 Create `weixin-cloud/utils/id-generator.ts`: unique 7-digit display ID generator. Strategy: generate random ID, attempt `db.collection('users').doc(generatedId).set()` — if doc already exists, the set will either fail or overwrite. Instead use: generate → `where({id: generatedId}).count()` → if 0, use it; else retry up to 100 times. For stronger atomicity, add the generated ID as a field (not `_id`) and accept theoretical race window (acceptable for low-traffic app).
- [ ] 2.4 Create `weixin-cloud/utils/credits.ts`: credits calculation logic (add/subtract points with floor at 0 for both `total_scores` and `available_scores`, level threshold check) — migrated from PostgreSQL `handle_order_credits` and `update_user_level` triggers. Document: `total_scores` = cumulative earned points, `available_scores` = currently spendable points (identical for now, diverge when redemption feature added)
- [ ] 2.5 Create `weixin-cloud/user-login/index.ts`: login cloud function — get OPENID from `getWxContext()` (no `wx.login()` needed), find or create user + credits in single transaction, return profile. Handle `getWxContext()` returning empty OPENID with clear auth error.
- [ ] 2.6 Create `weixin-cloud/create-order/index.ts`: order creation cloud function — (1) read products outside transaction via `doc(product_id).get()` to validate prices, (2) generate `order_id`, (3) run transaction: create order doc with `_id = order_id` (atomic uniqueness via doc ID), update credits, update level. Validate: total_amount = pre-discount sum, credits earned = total_amount - discount_amount. Cap cart at 20 items to stay within transaction limits.
- [ ] 2.7 Create `weixin-cloud/cancel-order/index.ts`: order cancellation cloud function — verify ownership via OPENID, validate status (only `pending` or `preparing`), run transaction: update order status, deduct both `total_scores` and `available_scores` with floor at 0, update level
- [ ] 2.8 Create `weixin-cloud/get-orders/index.ts`: order query cloud function — get user's orders by OPENID, get single order detail (with ownership verification: OPENID must match order's `user_id` to prevent order ID enumeration)
- [ ] 2.9 Create `weixin-cloud/get-profile/index.ts`: user profile cloud function — get user + credits by OPENID
- [ ] 2.10 Deploy all cloud functions to WeChat Cloud environment and verify each function responds correctly via `wx.cloud.callFunction` test calls

## 3. Auth Migration (G3)

- [ ] 3.1 Rewrite `src/stores/modules/userStore.ts`: remove JWT parsing (`parseJwtPayload`, `getTokenRemainingSeconds`, `isTokenExpired`, `isTokenExpiringSoon`), remove token storage (`TOKEN_KEY`, `REFRESH_TOKEN_KEY`), replace login flow with `wx.cloud.callFunction('user-login')`. On app restart, simply call `wx.cloud.callFunction('user-login')` again — no `wx.login()` needed since cloud function call inherently carries user identity.
- [ ] 3.2 Rewrite `src/api/userApi.ts`: replace `uni.request` to Edge Function with `wx.cloud.callFunction('user-login')`, replace Supabase queries with `wx.cloud.callFunction('get-profile')`
- [ ] 3.3 Update `src/App.vue` lifecycle: call `wx.cloud.init({ env: '<env-id>' })` in `onLaunch` before auth flow, with try-catch wrapping. On init failure: show retry prompt to user, don't crash. Store init success state for pages to check before making cloud API calls.

## 4. API Layer Rewrite (G4)

- [ ] 4.1 Rewrite `src/api/homeDataApi.ts`: replace `supabaseClient.query()` with `wx.cloud.database()` client-side queries for `categoried` and `products`, replace Supabase Storage URL construction with WeChat Cloud fileID resolution via `wx.cloud.getTempFileURL()`
- [ ] 4.2 Rewrite `src/api/orderApi.ts`: replace direct Supabase CRUD with `wx.cloud.callFunction()` calls to `create-order`, `cancel-order`, `get-orders` cloud functions. Send `totalAmount` as pre-discount sum (matching `cartStore.originalAmount`) and `discountAmount` as discount.
- [ ] 4.3 Create `src/utils/cloudStorage.ts`: shared helper to resolve WeChat Cloud fileIDs to displayable URLs via `wx.cloud.getTempFileURL()`. Must handle: (1) multi-fileID strings with `&` separator (products), (2) single fileIDs (categoried icons/active_icons), (3) fileIDs in order detail `oder_details.product_image`, (4) batching for multiple fileIDs (API accepts arrays), (5) caching resolved URLs with TTL (2-hour expiry), (6) partial failure handling (return resolved URLs for succeeded, placeholder for failed)
- [ ] 4.4 Verify all pages work: home (products + categories load), order creation, order list, order detail (with images), order cancellation, profile with credits/level display

## 5. Storage Migration (G5)

- [ ] 5.1 Upload all product images from Supabase `products-img` bucket to WeChat Cloud Storage, record fileID mapping
- [ ] 5.2 Upload all category icons from Supabase `project-icons` bucket to WeChat Cloud Storage, record fileID mapping
- [ ] 5.3 Update `products` collection `images` field: replace filenames with WeChat Cloud fileIDs
- [ ] 5.4 Update `categoried` collection `icon` and `active_icon` fields: replace full Supabase URLs with WeChat Cloud fileIDs
- [ ] 5.5 Update historical `orders.oder_details` records: replace all Supabase Storage image URLs with WeChat Cloud fileIDs

## 6. Data Migration (G6)

- [ ] 6.1 Create data migration script: export all data from Supabase PostgreSQL (using the exported SQL files in `C:\Users\Tu1231\Desktop\superbase\表数据\`), transform to WeChat Cloud Database document format. Script must run AFTER storage upload (G5) to have fileID mappings available.
- [ ] 6.2 Migrate `categoried` data: transform rows, update icon URLs to WeChat Cloud fileIDs
- [ ] 6.3 Migrate `products` data: transform rows, update image references to WeChat Cloud fileIDs, preserve original numeric ID as `_id`
- [ ] 6.4 Migrate `users` data: transform rows, use `openid` as document `_id`, fix display ID comment (7-digit)
- [ ] 6.5 Migrate `credits` data: transform rows, link to users by `openid`
- [ ] 6.6 Migrate `orders` data: transform rows, update `oder_details` image URLs to WeChat Cloud fileIDs, use `order_id` as document `_id`
- [ ] 6.7 Verify migration completeness: (1) record count comparison for all 5 collections, (2) verify every user has a corresponding credits record, (3) verify every order's `user_id` matches an existing user, (4) verify all product image fileIDs resolve via `getTempFileURL()`, (5) verify all category icon fileIDs resolve, (6) check for duplicate `order_id` or display `id`, (7) spot-check `total_amount` / `discount_amount` calculations

## 7. Cleanup

- [ ] 7.0 Add test coverage using **vitest** (or any minimal test runner). Testing strategy by layer:
   - **Layer 1 — Cloud function business logic (automated)**: credits calculation (add/subtract with floor at 0 for both `total_scores` and `available_scores`), level thresholds (4 tiers), order total validation (pre-discount amount + discount = credits earned), order status validation, display ID generation + collision retry. These are pure TypeScript functions, no mini program runtime needed.
   - **Layer 2 — Frontend API layer (automated)**: mock `wx.cloud.callFunction` and `wx.cloud.database()` to verify `orderApi.ts`, `homeDataApi.ts`, `userApi.ts` call correct cloud functions with correct parameters and handle responses/errors properly.
   - **Layer 3 — Mini program pages (manual only)**: WeChat Mini Program cannot be automated with browser testing tools (Playwright/Cypress). Manual verification in WeChat DevTools: page rendering, navigation, image loading, touch interactions. Covered by task 4.4.
- [ ] 7.1 Delete `src/utils/supabaseClient.ts`
- [ ] 7.2 Remove all Supabase-related code comments and references
- [ ] 7.3 Update `README.md`: replace Supabase backend documentation with WeChat Cloud
- [ ] 7.4 Update `CLAUDE.md`: replace Supabase references with WeChat Cloud development setup
- [ ] 7.5 Remove `.env` Supabase entries (keep only if other vars exist)
- [ ] 7.6 Run `pnpm type-check` and `pnpm lint:fix` to verify clean build
- [ ] 7.7 Remove `cspell.json` Supabase-related word entries if any
- [ ] 7.8 Clean up H5 platform config in `manifest.json`: remove or disable H5 platform declaration since `wx.cloud.*` APIs are WeChat-only
