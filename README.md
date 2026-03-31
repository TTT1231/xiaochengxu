# 甜品屋 - 甜品点单小程序

<div align="center">

**Dessert ordering made simple & sweet**

[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js)](https://vuejs.org/)
[![uni-app](https://img.shields.io/badge/uni--app-3.0-2b9939?logo=wechat)](https://uniapp.dcloud.net.cn/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)
[![Pinia](https://img.shields.io/badge/Pinia-State-fc6d26?logo=vue.js)](https://pinia.vuejs.org/)

<br />

<a href="#-english">English</a> &bull; <a href="#-中文">中文</a>

</div>

---

<br />

## 🇬🇧 English

<br />

### What is 甜品屋?

A cross-platform dessert ordering mini app built for **WeChat Mini Program** and **H5 Web**. Users can browse the menu, customize product specs, place orders, and earn loyalty points — all powered by a modern Vue 3 + Supabase stack.

<br />

### ✨ Key Highlights

| Feature | Description |
|:--------|:------------|
| 🍰 **Product Browsing** | Category-based product listing with rich detail pages and spec customization |
| 🛒 **Smart Cart** | Floating cart with real-time item count, spec selection, and quantity management |
| 📋 **Order Tracking** | Full order lifecycle — pending, preparing, ready, completed, cancelled |
| 🎁 **Points Mall** | Loyalty points system with redeemable rewards to drive repeat purchases |
| 👤 **User Profile** | Order history, points balance, and membership level management |
| 🌐 **Cross-Platform** | Single codebase compiles to WeChat Mini Program and H5 web |

<br />

### 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Vue 3 + Composition API (`<script setup>`) |
| Build Tool | Vite 5 + uni-app CLI |
| Language | TypeScript |
| State Management | Pinia |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Styling | SCSS with `rpx` responsive units |
| i18n | vue-i18n |
| Code Quality | ESLint + Prettier + vue-tsc + cspell |

<br />

### 📱 Pages

| Page | Route | Description |
|:-----|:------|:------------|
| Home / Order | `pages/index/index` | Product browsing with category tabs and floating cart |
| Orders | `pages/order/index` | Order list with status toggle (active / history) |
| Order Detail | `pages/order/detail` | Single order details and status timeline |
| Profile | `pages/profile/index` | User info, points, and settings menu |
| Points Mall | `pages/points/index` | Browse and redeem rewards with points |
| Cart | `pages/cart/index` | Cart items with spec editing and checkout |
| Product Detail | `pages/show-product-details/` | Product info, spec groups, and add-to-cart |

<br />

### 🚀 Getting Started

**Prerequisites:** Node.js 18+, pnpm, [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (for Mini Program target)

```bash
# Install dependencies
pnpm install

# Start development (compile + open WeChat DevTools + HMR)
node scripts/dev.mjs dev

# Or compile only (no DevTools)
pnpm dev:mp-weixin

# Stop DevTools integration
node scripts/dev.mjs stop

# Production build
pnpm build:mp-weixin
```

<br />

### 📂 Project Structure

```
src/
├── pages/           # Page components (routes in pages.json)
├── components/      # Feature-organized components
│   ├── common/      # Shared (Header, TabBar)
│   ├── home/        # Home page components
│   ├── order/       # Order components
│   ├── points/      # Points mall components
│   └── profile/     # Profile components
├── stores/          # Pinia state modules
├── composables/     # Vue composables
├── types/           # TypeScript definitions + DB schema
├── api/             # Supabase query layer
├── hooks/           # Vue hooks (env config)
├── utils/           # Utilities (format, Supabase client)
├── static/          # Static assets
├── data/            # Static data & constants
├── mock/            # Mock data for development
├── pages.json       # Page routing & tabBar config
├── manifest.json    # App metadata & platform configs
└── uni.scss         # Global SCSS design tokens
```

<br />

### 🔧 Code Quality

```bash
pnpm type-check    # TypeScript type checking
pnpm lint          # ESLint check
pnpm lint:fix      # ESLint auto-fix
pnpm format        # Prettier format
pnpm spell:check   # Spell check
```

<br />

### 📄 License

Private project — all rights reserved.

<br />

<p align="right"><a href="#-中文">切换到中文 →</a></p>

---

<br />

## 🇨🇳 中文

<br />

### 什么是甜品屋？

一款跨平台甜品点单小程序，支持**微信小程序**和 **H5 网页**。用户可以浏览菜单、自定义商品规格、下单、查看订单状态，并积累积分兑换奖励 —— 全部基于 Vue 3 + Supabase 现代技术栈构建。

<br />

### ✨ 核心功能

| 功能 | 说明 |
|:-----|:-----|
| 🍰 **商品浏览** | 按分类浏览商品，支持富图文详情页和规格自定义 |
| 🛒 **智能购物车** | 浮动购物车，实时显示商品数量，支持规格选择和数量管理 |
| 📋 **订单追踪** | 完整订单生命周期 — 待付款、制作中、待取餐、已完成、已取消 |
| 🎁 **积分商城** | 会员积分体系，可兑换奖励商品，促进复购 |
| 👤 **个人中心** | 订单历史、积分余额、会员等级管理 |
| 🌐 **跨平台** | 一套代码同时编译为微信小程序和 H5 网页 |

<br />

### 🛠 技术栈

| 层级 | 技术 |
|:-----|:-----|
| 框架 | Vue 3 + Composition API (`<script setup>`) |
| 构建工具 | Vite 5 + uni-app CLI |
| 语言 | TypeScript |
| 状态管理 | Pinia |
| 后端 | Supabase (PostgreSQL + Auth + RLS) |
| 样式 | SCSS + `rpx` 响应式单位 |
| 国际化 | vue-i18n |
| 代码质量 | ESLint + Prettier + vue-tsc + cspell |

<br />

### 📱 页面一览

| 页面 | 路由 | 说明 |
|:-----|:-----|:-----|
| 首页 / 点单 | `pages/index/index` | 分类浏览商品，浮动购物车入口 |
| 订单 | `pages/order/index` | 订单列表，支持进行中 / 历史订单切换 |
| 订单详情 | `pages/order/detail` | 单笔订单详情与状态时间线 |
| 我的 | `pages/profile/index` | 用户信息、积分、设置菜单 |
| 积分商城 | `pages/points/index` | 浏览和兑换积分奖励 |
| 购物车 | `pages/cart/index` | 购物车商品管理、规格编辑、结算 |
| 商品详情 | `pages/show-product-details/` | 商品信息、规格组、加入购物车 |

<br />

### 🚀 快速开始

**前置条件：** Node.js 18+、pnpm、[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（微信小程序目标）

```bash
# 安装依赖
pnpm install

# 启动开发（编译 + 打开微信开发者工具 + 热更新）
node scripts/dev.mjs dev

# 仅编译（不打开开发者工具）
pnpm dev:mp-weixin

# 关闭开发者工具集成
node scripts/dev.mjs stop

# 生产构建
pnpm build:mp-weixin
```

<br />

### 📂 项目结构

```
src/
├── pages/           # 页面组件（路由配置在 pages.json）
├── components/      # 按功能组织的组件
│   ├── common/      # 公共组件（Header、TabBar）
│   ├── home/        # 首页组件
│   ├── order/       # 订单组件
│   ├── points/      # 积分商城组件
│   └── profile/     # 个人中心组件
├── stores/          # Pinia 状态管理模块
├── composables/     # Vue 组合式函数
├── types/           # TypeScript 类型定义 + 数据库 Schema
├── api/             # Supabase 查询层
├── hooks/           # Vue Hooks（环境配置）
├── utils/           # 工具函数（格式化、Supabase 客户端）
├── static/          # 静态资源
├── data/            # 静态数据与常量
├── mock/            # 开发用模拟数据
├── pages.json       # 页面路由与 TabBar 配置
├── manifest.json    # 应用元数据与平台配置
└── uni.scss         # 全局 SCSS 设计令牌
```

<br />

### 🔧 代码质量

```bash
pnpm type-check    # TypeScript 类型检查
pnpm lint          # ESLint 检查
pnpm lint:fix      # ESLint 自动修复
pnpm format        # Prettier 格式化
pnpm spell:check   # 拼写检查
```

<br />

### 📄 许可证

私有项目 — 保留所有权利。

<br />

<p align="right"><a href="#-english">Switch to English →</a></p>
