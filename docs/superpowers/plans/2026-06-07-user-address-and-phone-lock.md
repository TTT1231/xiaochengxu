# 用户地址 + 手机号锁定 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户个人资料中增加地址字段，并对手机号实现绑定后不可修改的锁定机制。

**Architecture:** 自底向上分层改动：(1) 类型层 users.ts + api 类型 → (2) 云函数逻辑层 → (3) Store 层 → (4) UI 层。云函数中通过读取现有 phone 字段值来判断是否已绑定，不引入额外标记字段。

**Tech Stack:** TypeScript, WeChat Cloud Function, Vue 3 + Pinia, uni-app

---

### Task 1: 类型定义更新

**Files:**

- Modify: `src/types/db-scheme/users.ts`
- Modify: `src/api/userApi.ts`

**说明：** Users 接口加 `address` 字段，`UpdateProfileParams` 加显式 `address` 类型并去掉泛型索引。

- [ ] **Step 1: Users 类型加 address 字段**

编辑 `src/types/db-scheme/users.ts`，在 `phone?` 下方新增一行：

```typescript
/** 用户表 */
export interface Users {
   /** 文档 _id = openid (微信唯一用户标识) */
   _id: string;
   /** 用户名 */
   name: string;
   /** 唯一7位用户ID */
   id: string;
   /** 创建时间 */
   created_at: string;
   /** 手机号 */
   phone?: string;
   /** 地址 */
   address?: string;
}
```

- [ ] **Step 2: API 类型 UpdateProfileParams 加上 address**

编辑 `src/api/userApi.ts`，将 `UpdateProfileParams` 改为显式字段，去掉 `[key: string]: unknown`：

```typescript
export interface UpdateProfileParams {
   phone?: string;
   address?: string;
}
```

- [ ] **Step 3: 提交类型层改动**

```bash
git add src/types/db-scheme/users.ts src/api/userApi.ts
git commit -m "feat(db): add address field to Users and UpdateProfileParams

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 云函数 update-profile 改造

**Files:**

- Modify: `weixin-cloud/update-profile/index.ts`

**说明：** 核心逻辑改造：(1) 先读取当前 user 文档，(2) phone 传入时校验是否已绑定，(3) address 自由更新，(4) phone 校验失败整体拒绝。

- [ ] **Step 1: 重写云函数逻辑**

编辑 `weixin-cloud/update-profile/index.ts`，替换为以下内容：

```typescript
import { db, getOpenId } from '../utils/database';

interface UpdateProfileParams {
   phone?: string;
   address?: string;
}

interface UpdateProfileResult {
   success: boolean;
   message: string;
}

export async function main(event: UpdateProfileParams): Promise<UpdateProfileResult> {
   const openid = getOpenId();
   if (!openid) {
      return { success: false, message: 'Authentication failed' };
   }

   // 先读取当前用户数据（用于 phone 绑定校验）
   const { data: existingUser } = await db.collection('users').doc(openid).get();
   if (!existingUser) {
      return { success: false, message: 'User not found' };
   }

   const updateData: Record<string, string> = {};

   // phone 绑定保护：已有值则整体拒绝
   if (event.phone !== undefined) {
      if ((existingUser as Record<string, unknown>).phone) {
         return { success: false, message: '手机号已绑定，不可修改' };
      }
      if (!/^1[3-9]\d{9}$/.test(event.phone)) {
         return { success: false, message: '手机号格式不正确' };
      }
      updateData.phone = event.phone;
   }

   // address 自由更新
   if (event.address !== undefined) {
      updateData.address = event.address;
   }

   if (Object.keys(updateData).length === 0) {
      return { success: false, message: '没有需要更新的字段' };
   }

   try {
      await db.collection('users').doc(openid).update({ data: updateData });
      return { success: true, message: '更新成功' };
   } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: '更新失败: ' + msg };
   }
}
```

- [ ] **Step 2: 提交云函数改动**

```bash
git add weixin-cloud/update-profile/index.ts
git commit -m "feat(api): add phone lock and address support to update-profile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Store 层同步

**Files:**

- Modify: `src/stores/modules/userStore.ts`

**说明：** `updateUserProfile` 方法在成功后需要把 `address` 也同步到本地 state。

- [ ] **Step 1: userStore 的 updateUserProfile 补上 address 同步**

在 `src/stores/modules/userStore.ts` 中找到 `updateUserProfile` 方法，修改其中的 state 同步逻辑：

```typescript
async updateUserProfile(
   params: UpdateProfileParams,
): Promise<{ success: boolean; message: string }> {
   try {
      const result = await updateCloudProfile(params);
      if (result.success && this.user) {
         this.user = {
            ...this.user,
            ...(params.phone !== undefined ? { phone: params.phone } : {}),
            ...(params.address !== undefined ? { address: params.address } : {}),
         };
      }
      return result;
   } catch (error) {
      return {
         success: false,
         message: error instanceof Error ? error.message : '更新失败',
      };
   }
}
```

- [ ] **Step 2: 提交 store 改动**

```bash
git add src/stores/modules/userStore.ts
git commit -m "feat(store): sync address field in updateUserProfile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: 前端 edit.vue 改造

**Files:**

- Modify: `src/pages/profile/edit.vue`

**说明：** 两个 UI 改动：(1) 手机号绑定后变成纯只读展示，(2) 新增地址行（始终可编辑）。

- [ ] **Step 1: 改造 edit.vue 的 script 部分**

编辑 `<script setup lang="ts">` 部分，新增 address 相关状态和交互逻辑：

```typescript
const phone = ref('');
const originalPhone = ref('');
const address = ref(''); // ← 新增
const originalAddress = ref(''); // ← 新增
const isSaving = ref(false);

const nickname = computed(() => userStore.user?.name ?? '');

const hasPhone = computed(() => !!phone.value);
const isPhoneLocked = computed(() => !!phone.value); // 非空即锁定
const displayPhone = computed(() => {
   const p = phone.value;
   if (!p || p.length !== 11) return p || '';
   return p.slice(0, 3) + '****' + p.slice(7);
});

const hasChanges = computed(() => {
   return phone.value !== originalPhone.value || address.value !== originalAddress.value;
});

onShow(() => {
   const user = userStore.user;
   if (user) {
      phone.value = user.phone ?? '';
      originalPhone.value = user.phone ?? '';
      address.value = user.address ?? ''; // ← 新增
      originalAddress.value = user.address ?? ''; // ← 新增
   }
});
```

更新 `handleSave` 函数，将 address 纳入保存范围：

```typescript
async function handleSave(): Promise<void> {
   if (!hasChanges.value || isSaving.value) return;

   isSaving.value = true;
   try {
      const params: UpdateProfileParams = {};

      if (phone.value !== originalPhone.value) {
         if (phone.value && !/^1[3-9]\d{9}$/.test(phone.value)) {
            uni.showToast({ title: '手机号格式不正确', icon: 'none' });
            return;
         }
         // 只在有值时传入 phone（空表示未绑定，允许保存时传入 undefined）
         if (phone.value) {
            params.phone = phone.value;
         }
      }

      if (address.value !== originalAddress.value) {
         params.address = address.value;
      }

      if (Object.keys(params).length === 0) {
         isSaving.value = false;
         return;
      }

      const result = await userStore.updateUserProfile(params);
      if (result.success) {
         originalPhone.value = phone.value;
         originalAddress.value = address.value;
         uni.showToast({ title: '保存成功', icon: 'success' });
         setTimeout(() => {
            uni.navigateBack();
         }, 1000);
      } else {
         uni.showToast({ title: result.message, icon: 'none' });
      }
   } catch (error) {
      uni.showToast({
         title: error instanceof Error ? error.message : '保存失败',
         icon: 'none',
      });
   } finally {
      isSaving.value = false;
   }
}
```

更新 `handleBindPhone`，加上绑定后不可再点：

```typescript
function handleBindPhone(): void {
   if (isPhoneLocked.value) return; // 绑定后不可操作

   uni.showModal({
      title: '绑定手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: res => {
         if (res.confirm && res.content) {
            const input = res.content.trim();
            if (!/^1[3-9]\d{9}$/.test(input)) {
               uni.showToast({ title: '手机号格式不正确', icon: 'none' });
               return;
            }
            phone.value = input;
         }
      },
   });
}
```

新增 address 绑定函数：

```typescript
function handleEditAddress(): void {
   uni.showModal({
      title: '编辑地址',
      editable: true,
      placeholderText: '请输入地址',
      content: address.value,
      success: res => {
         if (res.confirm) {
            address.value = res.content?.trim() ?? '';
         }
      },
   });
}
```

注意：文件顶部需要引入 `UpdateProfileParams` 类型：

```typescript
import type { UpdateProfileParams } from '@/api/userApi';
```

- [ ] **Step 2: 改造 edit.vue 的 template 部分**

编辑 `<template>`，修改手机号行和新增地址行：

```diff
       <!-- 手机号 -->
-      <view class="form-item" @click="handleBindPhone()">
+      <view
+         class="form-item"
+         :class="{ 'form-item--disabled': isPhoneLocked }"
+         @click="handleBindPhone()"
+      >
          <text class="form-label">手机号</text>
          <view class="form-value form-value--phone">
-            <text v-if="hasPhone" class="phone-bound">{{ displayPhone }}</text>
-            <text v-else class="phone-unbound">点击绑定</text>
-            <text class="arrow">›</text>
+            <text v-if="hasPhone" class="phone-bound">{{ displayPhone }}</text>
+            <text v-else class="phone-unbound">点击绑定</text>
+            <text v-if="!isPhoneLocked" class="arrow">›</text>
          </view>
       </view>
+
+      <view class="form-divider" />
+
+      <!-- 地址 -->
+      <view class="form-item" @click="handleEditAddress()">
+         <text class="form-label">地址</text>
+         <view class="form-value form-value--phone">
+            <text v-if="address" class="phone-bound">{{ address }}</text>
+            <text v-else class="phone-unbound">点击填写</text>
+            <text class="arrow">›</text>
+         </view>
+      </view>
```

将 `form-divider` 的 `margin-left` 在第二行（地址行）改为 0（满宽分割线）：

```diff
-<view class="form-divider" />
+<view class="form-divider" :style="{ marginLeft: phone.value ? undefined : '160rpx' }" />
```

实际上这个分割线的逻辑应该简化。让我重新组织 template 结构——在昵称和手机号之间保留有 marginLeft 的分割线，在手机号和地址之间用满宽分割线：

```vue
      <!-- 昵称（不可修改） -->
      <view class="form-item">
         <text class="form-label">昵称</text>
         <view class="form-value">
            <text class="form-text">{{ nickname }}</text>
         </view>
      </view>

      <view class="form-divider" />

      <!-- 手机号 -->
      <view
         class="form-item"
         :class="{ 'form-item--disabled': isPhoneLocked }"
         @click="handleBindPhone()"
      >
         <text class="form-label">手机号</text>
         <view class="form-value form-value--phone">
            <text v-if="hasPhone" class="phone-bound">{{ displayPhone }}</text>
            <text v-else class="phone-unbound">点击绑定</text>
            <text v-if="!isPhoneLocked" class="arrow">›</text>
         </view>
      </view>

      <view class="form-divider form-divider--full" />

      <!-- 地址 -->
      <view class="form-item" @click="handleEditAddress()">
         <text class="form-label">地址</text>
         <view class="form-value form-value--phone">
            <text v-if="address" class="phone-bound">{{ address }}</text>
            <text v-else class="phone-unbound">点击填写</text>
            <text class="arrow">›</text>
         </view>
      </view>
```

- [ ] **Step 3: 改造 edit.vue 的 style 部分**

新增两个样式：

```scss
.form-item--disabled {
   opacity: 0.5;
}

.form-divider--full {
   margin-left: 0;
}
```

- [ ] **Step 4: 提交前端改动**

```bash
git add src/pages/profile/edit.vue
git commit -m "feat(ui): add address field and phone lock display in profile edit

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 数据库 schema 文档同步

**Files:**

- Modify: `weixin-cloud/database-schema.md`

**说明：** Users 集合的文档描述补上 `phone` 和 `address` 字段。

- [ ] **Step 1: 更新 database-schema.md 的 Users 部分**

将 `weixin-cloud/database-schema.md` 中 Users 集合的 interface 定义替换为：

```typescript
interface UserDocument {
   _id: string; // openid (WeChat unique user ID)
   name: string; // User display name
   id: string; // 唯一7位用户ID (7-digit display ID)
   created_at: string; // ISO timestamp
   phone?: string; // 手机号（绑定后不可修改）
   address?: string; // 地址（简单文本，可随时修改）
}
```

- [ ] **Step 2: 提交文档更新**

```bash
git add weixin-cloud/database-schema.md
git commit -m "docs(schema): sync users collection fields with current schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 验证清单

改动完成后逐项验证：

1. **手机号首次绑定**: 编辑页点击手机号行 → 弹出输入框 → 输入手机号 → 保存 → 成功 → UI 变为只读展示
2. **手机号再次修改**: 已绑定状态下点击手机号行 → 无反应（或确认不可修改的提示）
3. **手机号云函数防护**: 直接调云函数改已绑定 phone → 返回 "手机号已绑定，不可修改"
4. **地址增删改**: 编辑地址 → 保存 → 刷新后正确显示；清空地址 → 保存 → 显示 "点击填写"
5. **混合提交**: phone 未绑定 + address 一起保存 → 两个字段同时写入成功
6. **类型检查**: `pnpm exec vue-tsc --noEmit` 无类型错误
