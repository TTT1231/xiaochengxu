# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **uni-app (Vue 3)** cross-platform project using TypeScript. uni-app enables building apps for multiple platforms (H5, WeChat Mini Program, Alipay Mini Program, etc.) from a single codebase.

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

- **`src/pages.json`**: Central page routing configuration (similar to router config)
- First page in `pages` array is the app's entry page
- Add new pages by: 1) creating Vue file in `src/pages/`, 2) adding entry to `pages.json`

### Application Lifecycle

`src/App.vue` handles app-level lifecycle hooks from `@dcloudio/uni-app`:
- `onLaunch`: App initialization
- `onShow`: App foreground
- `onHide`: App background

### Platform-Specific Builds

Each platform has dedicated npm scripts (`dev:mp-*`, `build:mp-*`). Output directories:
- H5: `dist/build/h5/` or `dist/dev/h5/`
- Mini Programs: `dist/build/mp-weixin/` etc.

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

## Key Files

| File | Purpose |
|------|---------|
| `src/pages.json` | Page routes and global navigation style |
| `src/manifest.json` | App metadata, platform configs, permissions |
| `src/uni.scss` | Global SCSS variables |
| `src/shime-uni.d.ts` | uni-app type augmentations for Vue |

## Platform Notes

- Use `view`, `text`, `image` instead of HTML elements (`div`, `span`, `img`)
- Size units: `rpx` (responsive pixel, 750rpx = screen width)
- Some CSS features unavailable on Mini Programs
