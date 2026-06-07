# 配送/自提下单流程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户在购物车结算时可选择「到店自提」(默认) 或「商家配送」，配送模式需校验手机号/地址、计算配送费、可填备注

**Architecture:** 购物车页新增配送方式切换 UI + 配送费动态计算 + 地址校验。云函数 `get-delivery-config` 读取 `delivery_config` 集合（单行配置）。`create-order` 云函数接收配送相关字段并写入 Orders 表。订单详情页展示配送标签和备注。

**Tech Stack:** Vue 3 / uni-app / SCSS / 微信云开发 / TypeScript

---

### Task 1: 类型定义 — DeliveryType + Orders + DeliveryConfig

**Files:**

- Modify: `src/types/constants.ts`
- Modify: `src/types/db-scheme/orders.ts`
- Create: `src/types/db-scheme/delivery-config.ts`

- [ ] **Step 1: 在 constants.ts 新增 DeliveryType 类型**

```typescript
// src/types/constants.ts — 文件末尾新增

export type DeliveryType = 'pickup' | 'delivery';

export const DELIVERY_TYPE_TEXT: Record<DeliveryType, string> = {
   pickup: '到店自提',
   delivery: '商家配送',
};
```

- [ ] **Step 2: 在 orders.ts 的 Orders 接口新增字段**

```typescript
// src/types/db-scheme/orders.ts — Orders 接口新增

export interface Orders {
   // ... 现有字段不变
   // 新增 ↓
   delivery_type: 'pickup' | 'delivery';
   delivery_fee: number;
   remark?: string;
   delivery_address?: string;
   delivery_phone?: string;
}
```

- [ ] **Step 3: 新建 delivery-config.ts 类型文件**

```typescript
// src/types/db-scheme/delivery-config.ts

/** 配送费配置表（单行文档） */
export interface DeliveryConfig {
   _id: string;
   /** 满多少元免配送费 */
   free_threshold: number;
   /** 未满时的配送费 */
   delivery_fee: number;
   /** 最后修改时间 */
   updated_at: string;
}
```

- [ ] **Step 4: 确认新增类型被 types/index.ts 导出**

```bash
# 检查 src/types/index.ts 是否已 re-export db-scheme 下的所有文件
grep -n "db-scheme" src/types/index.ts
# 如果没有自动导出，手动加一行：
export * from './db-scheme/delivery-config';
```

- [ ] **Step 5: Commit**

```bash
git add src/types/constants.ts src/types/db-scheme/orders.ts src/types/db-scheme/delivery-config.ts
git commit -m "feat(types): add DeliveryType, Orders delivery fields, DeliveryConfig interface"
```

---

### Task 2: 新增云函数 get-delivery-config

**Files:**

- Create: `weixin-cloud/get-delivery-config/index.ts`

- [ ] **Step 1: 创建 get-delivery-config 云函数入口文件**

```typescript
// weixin-cloud/get-delivery-config/index.ts
import cloud from 'wx-server-sdk';
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV as unknown as string });

const db = cloud.database();

const DEFAULT_CONFIG = {
   free_threshold: 30,
   delivery_fee: 8,
};

export async function main(): Promise<{
   success: boolean;
   data?: { free_threshold: number; delivery_fee: number; updated_at?: string };
   message: string;
}> {
   try {
      const { data } = await db.collection('delivery_config').doc('config').get();
      if (!data) {
         return {
            success: true,
            data: { ...DEFAULT_CONFIG },
            message: '使用默认配置',
         };
      }
      return {
         success: true,
         data: {
            free_threshold: data.free_threshold as number,
            delivery_fee: data.delivery_fee as number,
            updated_at: data.updated_at as string,
         },
         message: 'Success',
      };
   } catch (error) {
      // 集合不存在或文档不存在时返回默认值
      return {
         success: true,
         data: { ...DEFAULT_CONFIG },
         message: '使用默认配置',
      };
   }
}
```

- [ ] **Step 2: 测试云函数本地可运行**

```bash
cd weixin-cloud && npx tsc --noEmit --pretty 2>&1 | head -30
# 确认无类型错误
```

- [ ] **Step 3: Commit**

```bash
git add weixin-cloud/get-delivery-config/index.ts
git commit -m "feat: add get-delivery-config cloud function"
```

---

### Task 3: 新增前端 API 层 deliveryApi.ts

**Files:**

- Create: `src/api/deliveryApi.ts`

- [ ] **Step 1: 创建 deliveryApi.ts**

```typescript
// src/api/deliveryApi.ts

export interface DeliveryConfigResult {
   free_threshold: number;
   delivery_fee: number;
}

/**
 * 获取配送费配置
 * @returns 配送费配置（获取失败时返回默认值，保证核心流程可用）
 */
export async function getDeliveryConfig(): Promise<DeliveryConfigResult> {
   const DEFAULT_CONFIG = { free_threshold: 30, delivery_fee: 8 };

   try {
      const res = await wx.cloud.callFunction({
         name: 'get-delivery-config',
         data: {},
      });

      const result = res.result as {
         success: boolean;
         data?: { free_threshold: number; delivery_fee: number };
      };

      if (result.success && result.data) {
         return {
            free_threshold: result.data.free_threshold,
            delivery_fee: result.data.delivery_fee,
         };
      }
      return DEFAULT_CONFIG;
   } catch {
      return DEFAULT_CONFIG;
   }
}

/**
 * 计算配送费
 */
export function calcDeliveryFee(
   totalAmount: number,
   deliveryType: 'pickup' | 'delivery',
   config: DeliveryConfigResult,
): number {
   if (deliveryType === 'pickup') return 0;
   return totalAmount >= config.free_threshold ? 0 : config.delivery_fee;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/deliveryApi.ts
git commit -m "feat(api): add deliveryApi with getDeliveryConfig and calcDeliveryFee"
```

---

### Task 4: 修改 create-order 云函数 — 接受配送参数

**Files:**

- Modify: `weixin-cloud/create-order/index.ts`

- [ ] **Step 1: 更新 CreateOrderParams 接口，添加配送相关字段**

```typescript
// weixin-cloud/create-order/index.ts — 替换现有 CreateOrderParams 接口

interface CreateOrderParams {
   items: CartItem[];
   totalAmount: number;
   discountAmount: number;
   walletDeduct?: number;
   // 新增 ↓
   deliveryType: 'pickup' | 'delivery';
   deliveryFee: number;
   remark?: string;
   deliveryAddress?: string;
   deliveryPhone?: string;
}
```

- [ ] **Step 2: 在主函数中解构新参数，并添加配送费安全校验**

```typescript
// weixin-cloud/create-order/index.ts — main 函数顶部

export async function main(event: Partial<CreateOrderParams> = {}) {
  const openid = getOpenId();
  if (!openid) {
    return { success: false, message: 'Authentication failed' };
  }

  const {
    items, totalAmount, discountAmount, walletDeduct = 0,
    deliveryType = 'pickup',   // 新增，默认自提
    deliveryFee = 0,           // 新增
    remark,                    // 新增
    deliveryAddress,           // 新增
    deliveryPhone,             // 新增
  } = event;

  // ... 现有校验代码不变 ...
```

- [ ] **Step 3: 在金额校验后、事务前插入配送费校验逻辑**

```typescript
// weixin-cloud/create-order/index.ts — 在金额校验之后、钱包校验之前新增

// 配送费校验（服务端重新计算，防止前端篡改）
if (deliveryType !== 'pickup' && deliveryType !== 'delivery') {
   return { success: false, message: 'Invalid delivery type' };
}
if (deliveryType === 'delivery') {
   try {
      const { data: configDoc } = await db.collection('delivery_config').doc('config').get();
      const freeThreshold = (configDoc?.free_threshold ?? 30) as number;
      const configFee = (configDoc?.delivery_fee ?? 8) as number;
      const expectedFee = expectedTotal >= freeThreshold ? 0 : configFee;
      if (Math.abs(deliveryFee - expectedFee) > EPSILON) {
         return { success: false, message: '配送费异常' };
      }
   } catch {
      return { success: false, message: '配送费配置读取失败' };
   }
}
```

- [ ] **Step 4: 在事务中写入 orders 文档时带上新字段**

```typescript
// weixin-cloud/create-order/index.ts — transaction 内的 add 调用

await transaction.collection('orders').add({
   data: {
      _id: orderId,
      order_id: orderId,
      user_id: openid,
      order_status: 'pending',
      total_amount: expectedTotal,
      discount_amount: expectedDiscount,
      wallet_deduct: normalizedWalletDeduct,
      created_at: now,
      oder_details: validatedItems,
      // 新增 ↓
      delivery_type: deliveryType,
      delivery_fee: deliveryFee,
      ...(remark ? { remark } : {}),
      ...(deliveryAddress ? { delivery_address: deliveryAddress } : {}),
      ...(deliveryPhone ? { delivery_phone: deliveryPhone } : {}),
   },
});
```

- [ ] **Step 5: 确认无类型错误**

```bash
cd weixin-cloud && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add weixin-cloud/create-order/index.ts
git commit -m "feat: add delivery params to create-order cloud function"
```

---

### Task 5: 更新 orderApi.ts — CreateOrderParams 扩展

**Files:**

- Modify: `src/api/orderApi.ts`

- [ ] **Step 1: 扩展 CreateOrderParams 接口**

```typescript
// src/api/orderApi.ts — 替换现有 CreateOrderParams 接口

interface CreateOrderParams {
   items: CartItemType[];
   totalAmount: number;
   discountAmount?: number;
   walletDeduct?: number;
   // 新增 ↓
   deliveryType: 'pickup' | 'delivery';
   deliveryFee: number;
   remark?: string;
   deliveryAddress?: string;
   deliveryPhone?: string;
}
```

- [ ] **Step 2: 更新 createOrder 函数，解构并传递新参数**

```typescript
// src/api/orderApi.ts — 替换现有 createOrder 函数

export async function createOrder(params: CreateOrderParams): Promise<Orders> {
  const {
    items, totalAmount, discountAmount = 0, walletDeduct = 0,
    deliveryType, deliveryFee, remark, deliveryAddress, deliveryPhone,
  } = params;

  const orderItems: CreateOrderItem[] = items.map(item => ({
    product_id: item.product._id,
    specs: item.selectedSpecs,
    quantity: item.quantity,
  }));

  try {
    const res = await wx.cloud.callFunction({
      name: 'create-order',
      data: {
        items: orderItems,
        totalAmount,
        discountAmount,
        walletDeduct,
        deliveryType,
        deliveryFee,
        ...(remark !== undefined ? { remark } : {}),
        ...(deliveryAddress !== undefined ? { deliveryAddress } : {}),
        ...(deliveryPhone !== undefined ? { deliveryPhone } : {}),
      },
    });
    // ... 后续不变
```

- [ ] **Step 3: 更新 normalizeOrder 函数，映射新字段**

```typescript
// src/api/orderApi.ts — normalizeOrder 函数

function normalizeOrder(raw: Record<string, unknown>): Orders {
   const details = (raw.oder_details ?? raw.order_details ?? []) as OrderDetailItem[];
   return {
      _id: raw._id as string,
      order_id: raw.order_id as string,
      user_id: raw.user_id as string,
      order_status: raw.order_status as Orders['order_status'],
      total_amount: raw.total_amount as number,
      discount_amount: (raw.discount_amount ?? 0) as number,
      created_at: raw.created_at as string,
      wallet_deduct: (raw.wallet_deduct ?? 0) as number,
      order_details: details,
      // 新增 ↓
      delivery_type: (raw.delivery_type ?? 'pickup') as Orders['delivery_type'],
      delivery_fee: (raw.delivery_fee ?? 0) as number,
      remark: raw.remark as string | undefined,
      delivery_address: raw.delivery_address as string | undefined,
      delivery_phone: raw.delivery_phone as string | undefined,
   };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/api/orderApi.ts
git commit -m "feat(api): extend CreateOrderParams for delivery fields"
```

---

### Task 6: 修改购物车页面 — 配送/自提切换 + 校验 + 备注

**Files:**

- Modify: `src/pages/cart/index.vue`

> 这是改动量最大的任务。购物车底部栏新增：配送方式切换行、配送信息面板、配送费行、备注输入框。结算按钮增加配送校验逻辑。

- [ ] **Step 1: 在 script setup 中新增状态变量和导入**

```typescript
// src/pages/cart/index.vue — script 区

import { ref, computed, onShow } from 'vue'; // 确保 onShow 已导入
import { getDeliveryConfig, calcDeliveryFee } from '@/api/deliveryApi';
import type { DeliveryConfigResult } from '@/api/deliveryApi';

// 新增状态
const deliveryType = ref<'pickup' | 'delivery'>('pickup');
const remark = ref('');
const deliveryConfig = ref<DeliveryConfigResult>({ free_threshold: 30, delivery_fee: 8 });

// 新增计算属性
const deliveryFee = computed(() =>
   calcDeliveryFee(cartStore.totalAmount, deliveryType.value, deliveryConfig.value),
);

const isDeliveryInfoComplete = computed(() => {
   if (deliveryType.value === 'pickup') return true;
   return !!userStore.user?.phone && !!userStore.user?.address;
});

const canCheckout = computed(
   () => cartItems.length > 0 && isDeliveryInfoComplete.value && !submitting.value,
);

const finalPayableAmount = computed(() =>
   Math.max(cartStore.totalAmount - walletDeductAmount.value + deliveryFee.value, 0),
);
```

- [ ] **Step 2: 在 onShow 中加载配送费配置**

```typescript
// src/pages/cart/index.vue — 确保 onShow 从 @dcloudio/uni-app 导入

// 注意：当前页面没有 onShow，需要添加
onShow(async () => {
   const config = await getDeliveryConfig();
   deliveryConfig.value = config;
});
```

- [ ] **Step 3: 更新 handleCheckout，传递配送参数**

```typescript
// src/pages/cart/index.vue — handleCheckout 函数

const handleCheckout = async () => {
   if (cartItems.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' });
      return;
   }
   if (!userStore.isAuthenticated) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
   }
   if (!isDeliveryInfoComplete.value) {
      uni.showToast({ title: '配送信息不完整', icon: 'none' });
      return;
   }

   submitting.value = true;
   try {
      const order = await createOrder({
         items: cartItems,
         totalAmount: cartStore.originalAmount,
         discountAmount: cartStore.totalDiscount,
         walletDeduct: walletDeductAmount.value,
         deliveryType: deliveryType.value,
         deliveryFee: deliveryFee.value,
         remark: remark.value || undefined,
         deliveryAddress:
            deliveryType.value === 'delivery' ? (userStore.user?.address ?? undefined) : undefined,
         deliveryPhone:
            deliveryType.value === 'delivery' ? (userStore.user?.phone ?? undefined) : undefined,
      });

      cartStore.clearCart();
      useWallet.value = false;
      remark.value = '';
      deliveryType.value = 'pickup';
      userStore.fetchProfile();

      uni.redirectTo({
         url: `/pages/order/detail?id=${order.order_id}`,
      });
   } catch (err) {
      uni.showToast({
         title: err instanceof Error ? err.message : '下单失败',
         icon: 'none',
      });
   } finally {
      submitting.value = false;
   }
};
```

- [ ] **Step 4: 在 template 底部栏中插入配送方式切换、配送费展示、备注输入**

在 wallet-deduct 区块和 checkout-row 区块之间插入新 UI。找到 `bottom-bar` 中的 `wallet-deduct` 块，在其下方新增：

```vue
<!-- 配送方式切换（在 wallet-deduct 下方） -->
<view class="delivery-section">
  <view class="delivery-toggle">
    <view
      class="toggle-option"
      :class="{ active: deliveryType === 'pickup' }"
      @click="deliveryType = 'pickup'"
    >
      <text class="toggle-icon">🏪</text>
      <text class="toggle-label">到店自提</text>
    </view>
    <view
      class="toggle-option"
      :class="{ active: deliveryType === 'delivery' }"
      @click="deliveryType = 'delivery'"
    >
      <text class="toggle-icon">🛵</text>
      <text class="toggle-label">商家配送</text>
    </view>
  </view>

  <!-- 配送模式下的地址面板 -->
  <view v-if="deliveryType === 'delivery'" class="delivery-panel">
    <view v-if="!isDeliveryInfoComplete" class="delivery-hint">
      <text class="hint-icon">⚠️</text>
      <view class="hint-text">
        <text class="hint-title">配送信息缺失</text>
        <text class="hint-desc">请先绑定手机号和地址</text>
      </view>
      <view class="hint-action" @click="goToProfile">去绑定 ❯</view>
    </view>
    <view v-else class="delivery-info">
      <view class="info-row">
        <text class="info-icon">📍</text>
        <text class="info-text">{{ userStore.user?.address }}</text>
      </view>
      <view class="info-row">
        <text class="info-icon">📱</text>
        <text class="info-text">{{ userStore.user?.phone }}</text>
      </view>
    </view>
  </view>

  <!-- 配送费（配送时显示） -->
  <view v-if="deliveryType === 'delivery'" class="delivery-fee-row">
    <view class="fee-left">
      <text class="fee-label">配送费</text>
      <text class="fee-threshold">(满{{ deliveryConfig.free_threshold }}免{{ deliveryConfig.delivery_fee }})</text>
    </view>
    <text class="fee-value" :class="{ free: deliveryFee === 0 }">
      {{ deliveryFee === 0 ? '免配送费' : '¥' + deliveryFee.toFixed(2) }}
    </text>
  </view>

  <!-- 备注 -->
  <view class="remark-section">
    <input
      class="remark-input"
      v-model="remark"
      placeholder="订单备注（选填）"
      maxlength="200"
    />
  </view>
</view>
```

- [ ] **Step 5: 修改结算行的金额为最终金额（含配送费）**

```vue
<!-- 修改现有 total-amount 显示 -->
<text class="total-amount">{{ formatPriceDisplay(finalPayableAmount) }}</text>
```

- [ ] **Step 6: 修改结算按钮的 disabled 逻辑**

```vue
<view class="checkout-btn" :class="{ disabled: !canCheckout }" @click="onCheckoutClick">
  <text class="checkout-text">{{ submitting ? '下单中...' : '去结算' }}</text>
</view>
```

- [ ] **Step 7: 添加 goToProfile 方法**

```typescript
// script 区方法

function goToProfile(): void {
   uni.navigateTo({ url: '/pages/profile/edit' });
}
```

- [ ] **Step 8: 添加对应的 SCSS 样式**

```scss
// src/pages/cart/index.vue — style 区末尾添加

.delivery-section {
   padding: 14rpx 0;
   border-top: 1rpx solid $border-default;
   margin-top: 10rpx;
}

.delivery-toggle {
   display: flex;
   background: $bg-page;
   border-radius: 12rpx;
   padding: 4rpx;
   gap: 4rpx;
}

.toggle-option {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8rpx;
   padding: 12rpx 0;
   border-radius: 10rpx;
   font-size: 24rpx;
   color: $text-muted;
   transition: all 0.2s;

   &.active {
      background: $bg-card;
      color: $brand-primary;
      font-weight: 600;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
   }
}

.toggle-icon {
   font-size: 28rpx;
}

.toggle-label {
   font-size: 24rpx;
}

.delivery-panel {
   margin-top: 12rpx;
}

.delivery-hint {
   display: flex;
   align-items: center;
   gap: 10rpx;
   background: #fef2f2;
   border: 1rpx solid #fecaca;
   border-radius: 12rpx;
   padding: 14rpx;
}

.hint-icon {
   font-size: 28rpx;
}

.hint-text {
   flex: 1;
}

.hint-title {
   font-size: 24rpx;
   font-weight: 600;
   color: #991b1b;
}

.hint-desc {
   font-size: 20rpx;
   color: #b91c1c;
}

.hint-action {
   font-size: 22rpx;
   color: $brand-primary;
   font-weight: 600;
   padding: 6rpx 14rpx;
   background: #fef3c7;
   border-radius: 16rpx;
}

.delivery-info {
   background: #f0fdf4;
   border: 1rpx solid #bbf7d0;
   border-radius: 12rpx;
   padding: 14rpx;
}

.info-row {
   display: flex;
   align-items: center;
   gap: 8rpx;
   padding: 4rpx 0;
}

.info-icon {
   font-size: 24rpx;
}

.info-text {
   font-size: 24rpx;
   color: #166534;
}

.delivery-fee-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10rpx 0 4rpx;
}

.fee-left {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
}

.fee-label {
   font-size: 24rpx;
   color: $text-secondary;
}

.fee-threshold {
   font-size: 20rpx;
   color: $text-muted;
}

.fee-value {
   font-size: 26rpx;
   font-weight: 600;
   color: $text-primary;

   &.free {
      color: #16a34a;
   }
}

.remark-section {
   margin-top: 8rpx;
}

.remark-input {
   width: 100%;
   height: 64rpx;
   background: $bg-page;
   border-radius: 10rpx;
   padding: 0 20rpx;
   font-size: 24rpx;
   color: $text-primary;
   box-sizing: border-box;
}
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/cart/index.vue
git commit -m "feat(ui): add delivery/pickup toggle, address validation, remark to cart page"
```

---

### Task 7: 修改订单详情页 — 展示配送/自提信息

**Files:**

- Modify: `src/pages/order/detail.vue`

- [ ] **Step 1: 在 meta-card 中新增配送方式行**

在 meta-card 底部、商品数量行下方新增：

```vue
<!-- meta-card 内，商品数量行下方 -->
<view class="meta-divider" />
<view class="meta-row">
  <text class="meta-key">配送方式</text>
  <text class="meta-val">
    {{ order.delivery_type === 'delivery' ? '🛵 商家配送' : '🏪 到店自提' }}
  </text>
</view>
```

- [ ] **Step 2: 配送模式下新增地址/手机号展示**

```vue
<!-- meta-card 内，配送方式行下方，配送时显示 -->
<template v-if="order.delivery_type === 'delivery' && order.delivery_address">
   <view class="meta-divider" />
   <view class="meta-row">
      <text class="meta-key">配送地址</text>
      <text class="meta-val" style="max-width: 60%; text-align: right;">{{
         order.delivery_address
      }}</text>
   </view>
</template>
<template v-if="order.delivery_type === 'delivery' && order.delivery_phone">
   <view class="meta-divider" />
   <view class="meta-row">
      <text class="meta-key">联系电话</text>
      <text class="meta-val">{{ order.delivery_phone }}</text>
   </view>
</template>
```

- [ ] **Step 3: 在费用明细中展示配送费（配送时）**

在「商品总价」和「优惠减免」之间插入配送费行：

```vue
<!-- fee breakdown 内，商品总价下方 -->
<view v-if="order.delivery_fee > 0" class="fee-row">
  <text class="fee-label">配送费</text>
  <text class="fee-amount">{{ formatPriceDisplay(order.delivery_fee) }}</text>
</view>
```

- [ ] **Step 4: 展示备注（如果有）**

在 meta-card 末尾或费用明细区上方插入：

```vue
<!-- 在商品明细前或 meta-card 后，如有备注则显示 -->
<template v-if="order.remark">
   <view class="section-card">
      <text class="section-heading">订单备注</text>
      <text class="remark-text">{{ order.remark }}</text>
   </view>
</template>
```

添加备注文本样式：

```scss
.remark-text {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 40rpx;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/order/detail.vue
git commit -m "feat(ui): show delivery/pickup type, address, fee, remark in order detail"
```

---

### Task 8: 数据库初始化 — 创建 delivery_config 集合

**Files:**

- 微信云开发控制台操作

- [ ] **Step 1: 在微信云开发控制台创建 delivery_config 集合**

```bash
# 在微信开发者工具中：
# 1. 打开「云开发」控制台
# 2. 进入「数据库」标签
# 3. 点击「新建集合」- 名称: delivery_config
# 4. 添加一条记录:
#    _id: "config"
#    free_threshold: 30
#    delivery_fee: 8
#    updated_at: "<当前时间 ISO 字符串>"
```

- [ ] **Step 2: 验证集合可用**

```bash
# 在小程序开发者工具中重新编译
# 进入购物车页面，打开 vConsole 查看 get-delivery-config 调用是否成功返回
# 预期返回: { free_threshold: 30, delivery_fee: 8 }
```

---

### Spec Coverage Check

| Spec 需求                   | 对应 Task                           |
| --------------------------- | ----------------------------------- |
| DeliveryType 类型           | Task 1                              |
| Orders 表新增字段           | Task 1                              |
| delivery_config 集合 + 类型 | Task 1 (类型) + Task 8 (数据库)     |
| get-delivery-config 云函数  | Task 2                              |
| 前端配送费 API              | Task 3                              |
| create-order 配送参数       | Task 4 (云函数) + Task 5 (前端 API) |
| 配送费服务器端安全校验      | Task 4 Step 3                       |
| 购物车配送/自提切换 UI      | Task 6                              |
| 配送地址校验 + 引导绑定     | Task 6                              |
| 配送费展示                  | Task 6                              |
| 备注输入                    | Task 6                              |
| 订单详情配送信息            | Task 7                              |
| 默认自提流程不变            | Task 6 (deliveryType 默认 pickup)   |

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-07-delivery-pickup-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
