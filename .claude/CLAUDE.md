# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**甜品点单小程序** (Dessert Order Mini App) - A cross-platform ordering application built with **uni-app (Vue 3)** and TypeScript. Supports H5 web and WeChat Mini Program platforms.

## Common Commands

```bash
# Development (compile + open WeChat DevTools + HMR)
node scripts/dev.mjs dev    # Start dev server, auto-open DevTools
node scripts/dev.mjs stop   # Close project in WeChat DevTools

# Build (output to dist/dev/mp-weixin)
pnpm dev:mp-weixin   # Compile only (no DevTools open)
pnpm build:mp-weixin # Production build

# Code Quality
pnpm type-check      # TypeScript type checking (vue-tsc)
pnpm lint:fix        # ESLint auto-fix + Prettier format
```

## Project Structure

```
src/
├── pages/                    # Page components (routes in pages.json)
│   ├── index/               # 首页/点单 (Home/Order)
│   ├── order/               # 订单 (Orders) + order/detail.vue
│   ├── profile/             # 我的 (Profile)
│   ├── points/              # 积分商城 (Points Mall)
│   ├── cart/                # 购物车 (Cart)
│   └── show-product-details/ # 商品详情页 (Product Details)
├── components/               # Organized by feature
│   ├── common/              # Header, TabBar
│   ├── home/                # Banner, ProductCard, FloatingCart
│   ├── order/               # OrderCard, OrderToggle, HistoryCard
│   ├── points/              # PointsCard, RewardCard
│   └── profile/             # UserCard, StatsCard, MenuList
├── stores/modules/           # Pinia: cartStore, homeStore, userStore
├── composables/              # useHeaderHeight, useOrder, useUserLevel
├── types/                    # TypeScript types + db-scheme/
├── api/                      # Supabase query layer
├── hooks/                    # useEnvConfig (Supabase URL/Key)
├── data/                     # Static constants (imgPaths)
├── utils/                    # format, supabaseClient
├── static/                   # Images, icons
├── pages.json                # Page routing & tabBar config
├── manifest.json             # App metadata & platform configs
├── uni.scss                  # Global SCSS design tokens
└── App.vue                   # App root with lifecycle hooks
```

## Architecture

### Entry Point Pattern

uni-app uses a **SSR-compatible entry** pattern. The entry is `src/main.ts` with `createApp()` factory function:

```typescript
import { createSSRApp } from 'vue';
import App from './App.vue';
export function createApp() {
   const app = createSSRApp(App);
   return { app };
}
```

### Page Configuration

- **`src/pages.json`**: Central page routing configuration
- First page in `pages` array is the app's entry page
- Custom TabBar enabled (`tabBar.custom: true`)
- Add new pages: 1) create Vue file in `src/pages/`, 2) add entry to `pages.json`

### State Management

Uses **Pinia** stores under `src/stores/modules/`:

- `cartStore.ts` — Cart items, total count/amount, add/remove/clear
- `homeStore.ts` — Home page data (products, categories)
- `userStore.ts` — User profile, auth state, points/credits

### Component Organization

Components are organized **by feature**, not by type:
- `components/home/` - Components used only in home page
- `components/common/` - Shared components (TabBar, Header)
- Easy to find related files when working on a feature

## Code Conventions

### TypeScript Imports

Use **type-only imports** per ESLint config:

```typescript
import type { Ref } from 'vue';
import { ref } from 'vue';  // Runtime imports separate
```

### Vue Component Structure

Follow the **script-first** pattern for consistency:

```vue
<script setup lang="ts">
// 1. Logic first - imports, types, props, emits, state, methods
import type { Product } from '@/types';
import { ref } from 'vue';

interface Props {
   product: Product;
}

defineProps<Props>();
</script>

<template>
   <!-- 2. Template second - uni-app native components -->
   <view class="product-card">
      <text>{{ product.name }}</text>
   </view>
</template>

<style lang="scss" scoped>
/* 3. Styles last - use rpx units for responsive sizing */
.product-card {
   padding: 24rpx;
}
</style>
```

**Rules:**
- **Always** include `<script setup lang="ts">` even if empty (for consistency)
- uni-app uses native components: `view`, `text`, `image` (not `div`, `span`, `img`)
- Size units: `rpx` (750rpx = screen width)

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

### easycom Auto-import

Components matching patterns are auto-imported:
- `uni-*` → `@dcloudio/uni-ui` components
- Custom components in `@/components/` are auto-registered

## Key Files

| File | Purpose |
|------|---------|
| `src/pages.json` | Page routes, tabBar config, easycom settings |
| `src/manifest.json` | App metadata, platform configs, permissions |
| `src/uni.scss` | Global SCSS variables (brand colors, spacing, shadows) |
| `src/shime-uni.d.ts` | uni-app type augmentations for Vue |
| `src/utils/supabaseClient.ts` | Supabase client initialization |
| `src/hooks/useEnvConfig.ts` | Environment config (Supabase URL/Key) |

## Environment Configuration

Supabase credentials are set via `.env` file at project root:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

Accessed at runtime via `useEnvConfig()` composable → `import.meta.env.VITE_*`.

## Design System (uni.scss)

Brand colors, status colors, text colors, spacing, shadows, and border radii are defined in `src/uni.scss`. Key variables:

- `$brand-primary: #ee862b` — Main orange
- `$status-*` — Order status colors (pending/preparing/ready/completed)
- `$text-primary/secondary/tertiary/muted` — Text hierarchy
- `$radius-sm/md/lg/xl` — Border radii (rpx)
- `$shadow-sm/card/lg` — Elevation levels

## Data Types

All types are defined in `src/types/`:
- `src/types/constants.ts` — `OrderStatus` (includes `cancelled`), `ORDER_STATUS_TEXT`
- `src/types/db-scheme/` — Supabase DB schema types (`Products`, `Categoried`, `Orders`, `Users`, `Credits`)

## Platform Notes

- Use `view`, `text`, `image` instead of HTML elements (`div`, `span`, `img`)
- Size units: `rpx` (responsive pixel, 750rpx = screen width)
- Custom navigation style enabled (`navigationStyle: "custom"`)
- Custom TabBar enabled (`tabBar.custom: true` in `pages.json`)

### WeChat Mini Program Gotchas

- **Empty script tag**: `<script setup lang="ts"></script>` is compiled away by uni-app, no bundle size impact
- **rpx units**: Always use `rpx` for responsive layouts, never `px` for spacing/sizing
- **Image paths**: Use absolute paths from `/static/` or `@/static/`
- **v-for with :key**: Always required for list rendering performance
- **Page lifecycle**: Use `onReady`, `onPageScroll` from `@dcloudio/uni-app`, not Vue's `onMounted`
- **TabBar**: Custom TabBar managed via `src/components/common/TabBar.vue`
- **Navigation**: Header component handles custom navigation bar
- **Safe areas**: Use `env(safe-area-inset-bottom)` for bottom spacing

## Dependencies

| Package | Purpose |
|---------|---------|
| `vue` | Core framework |
| `vue-i18n` | Internationalization |
| `@dcloudio/uni-*` | uni-app platform modules (WeChat, H5, etc.) |
| `sass` | SCSS preprocessing |
| `supabase-wechat-stable-v2` | Supabase client for WeChat Mini Program |
| `pinia` | State management |

## Development Workflow

### Adding a New Page

1. Create Vue file in `src/pages/<feature>/index.vue`
2. Add entry to `src/pages.json`:
   ```json
   {
     "path": "pages/<feature>/index",
     "style": { "navigationBarTitleText": "<Title>" }
   }
   ```
3. Follow script-first Vue structure

### Adding a New Component

1. Determine scope: `common/` (shared) or `<feature>/` (page-specific)
2. Create in `src/components/<scope>/<Name>.vue`
3. easycom auto-imports components matching patterns

## TypeScript Configuration

- **Deprecated options**: `importsNotUsedAsValues` and `preserveValueImports` are inherited from `@vue/tsconfig` but overridden locally in `tsconfig.json` to suppress IDE warnings
- Local tsc version is 4.9.5 (does not report these as deprecated); VS Code uses its bundled TS which may show warnings — these are safe to ignore
- See `.claude/rules/tsconfig-deprecated-options.md` for details
