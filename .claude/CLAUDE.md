# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**甜品点单小程序** (Dessert Order Mini App) - A cross-platform ordering application built with **uni-app (Vue 3)** and TypeScript. Supports H5 web and WeChat Mini Program platforms.

## Common Commands

```bash
# Development
pnpm dev:h5          # H5 web development
pnpm dev:mp-weixin   # WeChat Mini Program development

# Build
pnpm build:h5        # Build for H5
pnpm build:mp-weixin # Build for WeChat Mini Program

# Code Quality
pnpm type-check      # TypeScript type checking (vue-tsc)
pnpm lint            # ESLint check
pnpm lint:fix        # ESLint auto-fix
pnpm format          # Prettier format
```

## Project Structure

```
src/
├── pages/                    # Page components (routes configured in pages.json)
│   ├── index/               # 首页/点单 (Home/Order)
│   ├── order/               # 订单 (Orders)
│   ├── profile/             # 我的 (Profile)
│   ├── points/              # 积分商城 (Points Mall)
│   └── cart/                # 购物车 (Cart)
├── components/
│   ├── common/              # Shared components (Header, TabBar, SearchBar)
│   ├── home/                # Home page components (Banner, CategorySidebar, ProductCard, FloatingCart)
│   ├── order/               # Order page components (OrderCard, OrderToggle, HistoryCard)
│   ├── points/              # Points page components (CategoryTabs, PointsCard, RewardCard)
│   └── profile/             # Profile page components (UserCard, StatsCard, MenuList)
├── composables/             # Vue composables (state management)
│   ├── useCart.ts          # Cart state & operations
│   └── useOrder.ts         # Order logic
├── types/                   # TypeScript type definitions
│   ├── index.ts            # Re-export all types
│   ├── product.ts          # Product, Category, CartItem
│   ├── order.ts            # Order, OrderItem, OrderStatus
│   └── user.ts             # User, Reward
├── mock/                    # Mock data for development
│   ├── products.ts         # Product catalog
│   ├── categories.ts       # Product categories
│   ├── orders.ts           # Sample orders
│   ├── user.ts             # User profile data
│   └── rewards.ts          # Points rewards
├── utils/                   # Utility functions
│   └── format.ts           # Formatting helpers
├── data/                    # Static data
│   └── imgPaths.ts         # Image path constants
├── static/                  # Static assets (images, icons)
├── pages.json               # Page routing configuration
├── manifest.json            # App metadata & platform configs
├── uni.scss                 # Global SCSS variables
└── App.vue                  # App root with lifecycle hooks
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

Uses **Vue Composables** pattern with module-level reactive state:

```typescript
// composables/useCart.ts - Global cart state
const cartItems = ref<CartItem[]>([]); // Module-level state (singleton)

export function useCart() {
   // Computed properties and methods
   return { items, totalCount, totalAmount, addItem, removeItem, clearCart };
}
```

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

```vue
<script setup lang="ts">
// Composition API with <script setup>
</script>

<template>
<!-- uni-app uses native components: view, text, image (not div, span, img) -->
</template>

<style lang="scss" scoped>
/* Use rpx units for responsive sizing */
</style>
```

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
| `src/mock/readme.md` | Mock data structure documentation |

## Design System (uni.scss)

### Brand Colors

```scss
$brand-primary: #ee862b;      // Main orange
$brand-primary-light: rgba(238, 134, 43, 0.1);
$brand-primary-dark: #d67520;
```

### Status Colors (Order Status)

```scss
$status-pending: #f59e0b;     // 待处理
$status-preparing: #3b82f6;   // 制作中
$status-ready: #10b981;       // 待取餐
$status-completed: #6b7280;   // 已完成
```

### Text Colors

```scss
$text-primary: #0f172a;       // Primary text
$text-secondary: #475569;     // Secondary text
$text-tertiary: #64748b;      // Tertiary text
$text-muted: #94a3b8;         // Muted/placeholder
```

## Data Types

### Core Types

```typescript
interface Product {
   id: string;
   name: string;
   description: string;
   price: number;
   image: string;
   categoryId: string;
}

interface CartItem {
   product: Product;
   quantity: number;
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

interface Order {
   id: string;
   orderNo: string;
   storeName: string;
   status: OrderStatus;
   items: OrderItem[];
   totalAmount: number;
   createdAt: string;
}
```

## Platform Notes

- Use `view`, `text`, `image` instead of HTML elements (`div`, `span`, `img`)
- Size units: `rpx` (responsive pixel, 750rpx = screen width)
- Some CSS features unavailable on Mini Programs
- Custom navigation style enabled (`navigationStyle: "custom"`)

## Dependencies

| Package | Purpose |
|---------|---------|
| `vue` | Core framework |
| `vue-i18n` | Internationalization |
| `@dcloudio/uni-*` | uni-app platform modules |
| `sass` | SCSS preprocessing |
| `canvas` | Canvas operations |
