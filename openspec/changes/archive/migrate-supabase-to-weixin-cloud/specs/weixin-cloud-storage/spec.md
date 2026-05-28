## ADDED Requirements

### Requirement: Product images migrated to WeChat Cloud Storage
The system SHALL migrate all product images from Supabase `products-img` bucket to WeChat Cloud Storage. Images in the database SHALL be stored as WeChat Cloud `fileID` format (`cloud://env-id.xxxx/bucket/filename`), with multiple fileIDs separated by `&`.

#### Scenario: Product image loading
- **WHEN** the mini program loads a product with images field `cloud://env.xxxx/products-img/tz1.png&cloud://env.xxxx/products-img/tz1_des_1.png`
- **THEN** the system SHALL split by `&`, pass all fileIDs to `wx.cloud.getTempFileURL()` in a single batch call, and return the full list of displayable URLs

#### Scenario: Multiple product images
- **WHEN** a product has multiple images separated by `&`
- **THEN** the system SHALL split the string, resolve all fileIDs in a single batched `getTempFileURL()` call, and return the full list of displayable URLs

#### Scenario: Product with no images
- **WHEN** a product has an empty string in the `images` field
- **THEN** the system SHALL return an empty array without calling `getTempFileURL()`

### Requirement: Category icons migrated to WeChat Cloud Storage
The system SHALL migrate all category icons from Supabase `project-icons` bucket to WeChat Cloud Storage. The `categoried` collection SHALL store full WeChat Cloud fileIDs (not filenames) in `icon` and `active_icon` fields.

#### Scenario: Category icon display
- **WHEN** the mini program renders a category with `icon: "cloud://env.xxxx/project-icons/recommend.svg"`
- **THEN** the system SHALL pass the fileID to `wx.cloud.getTempFileURL()` and obtain a displayable URL

#### Scenario: Active icon display
- **WHEN** the mini program renders the active state of a category with `active_icon: "cloud://env.xxxx/project-icons/recommend-active.svg"`
- **THEN** the system SHALL pass the fileID to `wx.cloud.getTempFileURL()` and obtain a displayable URL

### Requirement: Historical order image URLs updated
The system SHALL update all Supabase Storage URLs in existing `orders.oder_details` records to use WeChat Cloud fileIDs during data migration.

#### Scenario: Old order with Supabase image URL
- **WHEN** an existing order's `oder_details` contains `product_image: "https://xxx.supabase.co/storage/v1/object/public/products-img/xd1.png"`
- **THEN** the migration script SHALL replace it with the corresponding WeChat Cloud fileID

#### Scenario: Order detail image resolution
- **WHEN** the mini program displays an order detail with fileID-based images in `oder_details`
- **THEN** the system SHALL resolve fileIDs via `wx.cloud.getTempFileURL()` using the same `cloudStorage.ts` helper as products and categories

### Requirement: Remove Supabase Storage URL construction
The system SHALL remove all Supabase Storage URL prefix logic (`${supabaseUrl}/storage/v1/object/public/...`) from the frontend code.

#### Scenario: HomeDataApi no longer constructs Supabase URLs
- **WHEN** `getRightProductData()` fetches products
- **THEN** it SHALL NOT reference Supabase URL or construct Storage URLs

### Requirement: FileID URL resolution with caching and error handling
The system SHALL implement robust fileID-to-URL resolution with caching, batching, and error handling.

#### Scenario: URL caching
- **WHEN** a fileID is resolved to a temporary URL
- **THEN** the system SHALL cache the result with a TTL of 2 hours (matching `getTempFileURL()` default expiry). Subsequent requests for the same fileID SHALL return the cached URL until expiry.

#### Scenario: Cached URL expired
- **WHEN** a cached URL has expired (TTL exceeded)
- **THEN** the system SHALL re-resolve the fileID via `wx.cloud.getTempFileURL()` and update the cache

#### Scenario: Batch resolution
- **WHEN** multiple fileIDs need resolution (e.g., product with 3 images)
- **THEN** the system SHALL pass all fileIDs in a single `wx.cloud.getTempFileURL()` call (the API accepts arrays)

#### Scenario: Partial resolution failure
- **WHEN** `getTempFileURL()` returns errors for some fileIDs in a batch
- **THEN** the system SHALL return successfully resolved URLs and use a placeholder image for failed fileIDs, logging the error for debugging
