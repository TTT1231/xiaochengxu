## ADDED Requirements

### Requirement: Replace Supabase client with WeChat Cloud Database client
The system SHALL use `wx.cloud.database()` (client-side) and `cloud.database()` (cloud function side) for all database operations. The `supabaseClient.ts` module SHALL be replaced with a WeChat Cloud Database wrapper.

#### Scenario: Client-side read-only database access
- **WHEN** the mini program needs to read product or category data
- **THEN** the system SHALL use `wx.cloud.database()` to query the `products` and `categoried` collections directly from the client

#### Scenario: Cloud function database access with admin privileges
- **WHEN** a cloud function needs to write data (create order, update credits)
- **THEN** the system SHALL use the cloud function's `cloud.database()` instance which has full read/write access. Collection security rules MUST be configured to grant cloud functions admin-level access.

### Requirement: Database collections match existing table schema
The system SHALL create the following collections in WeChat Cloud Database with fields matching the existing PostgreSQL schema: `users`, `products`, `orders`, `credits`, `categoried`.

#### Scenario: Collection field structure
- **WHEN** the `orders` collection is created
- **THEN** it SHALL contain fields: `_id`, `order_id`, `user_id`, `order_status`, `total_amount`, `created_at`, `oder_details`, `discount_amount`

#### Scenario: Legacy field names preserved
- **WHEN** the `orders` collection stores order detail items
- **THEN** the field name SHALL be `oder_details` (preserving the legacy typo) to maintain data migration compatibility

#### Scenario: Document IDs strategy
- **WHEN** documents are inserted into collections
- **THEN** `users._id` SHALL be the user's `openid`, `orders._id` SHALL be the generated `order_id`, and `products._id` SHALL preserve the original numeric ID from PostgreSQL (enabling `doc(id).get()` inside transactions)

### Requirement: TypeScript types updated for document database
The system SHALL update type definitions in `src/types/db-scheme/` to remove PostgreSQL-specific types (UUID, bigint) and use string/number types compatible with the WeChat Cloud document model.

#### Scenario: Products type definition
- **WHEN** the `Products` type is updated
- **THEN** `_id` SHALL be `string` instead of UUID string, `categoried_id` SHALL be `number`, and `specs` SHALL remain `Record<string, unknown>` (JSON equivalent)

#### Scenario: Display ID type
- **WHEN** the `Users` type is updated
- **THEN** the `id` field comment SHALL say "唯一7位用户ID" (7-digit, not 6-digit) to match the actual implementation

### Requirement: Cloud initialization before any database or storage access
The system SHALL call `wx.cloud.init()` in `App.vue` `onLaunch` before any page loads. All cloud API calls (`wx.cloud.database()`, `wx.cloud.callFunction()`, `wx.cloud.getTempFileURL()`) depend on this initialization. The init call SHALL complete before any API layer function executes.

#### Scenario: App startup initializes cloud
- **WHEN** the mini program launches
- **THEN** `App.vue` `onLaunch` SHALL call `wx.cloud.init({ env: '<env-id>' })` synchronously as its first operation, before any store initialization or page rendering

#### Scenario: Page loads after cloud init
- **WHEN** the home page queries products and categories
- **THEN** cloud init SHALL have already completed, ensuring `wx.cloud.database()` is available

#### Scenario: Cloud init fails
- **WHEN** `wx.cloud.init()` throws an error (network issue, invalid env ID, etc.)
- **THEN** the system SHALL catch the error, display a retry prompt to the user, and NOT crash. Pages SHALL check init success state before making cloud API calls and show appropriate loading/error states.

### Requirement: Environment variables updated
The system SHALL remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `vite.config.ts` and `useEnvConfig.ts`. WeChat Cloud configuration SHALL be managed through `project.config.json` and `project.private.config.json`.

#### Scenario: Build without Supabase env vars
- **WHEN** the project is built for mp-weixin platform
- **THEN** no Supabase-related environment variables SHALL be required

### Requirement: Application-level data validation replaces database constraints
The system SHALL enforce data integrity through cloud function validation logic instead of PostgreSQL CHECK constraints and foreign keys.

#### Scenario: Order status validation
- **WHEN** a cloud function receives an order status value
- **THEN** it SHALL validate that the value is one of: `pending`, `preparing`, `ready`, `completed`, `cancelled`

#### Scenario: User level validation
- **WHEN** a cloud function updates a user's level
- **THEN** it SHALL validate that the value is one of: `普通会员`, `黄铜会员`, `白银会员`, `黄金会员`

### Requirement: Database collection security rules configured
The system SHALL configure security rules for each collection to enforce the cloud-function-only-writes security model.

#### Scenario: Client access to read-only collections
- **WHEN** the client reads from `products` or `categoried` collections
- **THEN** the security rules SHALL allow client-side read access but deny all write access

#### Scenario: Client access to protected collections
- **WHEN** the client attempts to access `users`, `orders`, or `credits` collections
- **THEN** the security rules SHALL deny all direct client access (read and write). These collections are only accessible through cloud functions.
