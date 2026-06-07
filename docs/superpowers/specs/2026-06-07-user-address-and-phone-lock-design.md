# 用户地址 + 手机号锁定设计

- **日期**: 2026-06-07
- **涉及范围**: Users 表 / 云函数 update-profile / 前端 edit.vue
- **状态**: 定稿

---

## 1. 需求概要

1. **地址**: 用户个人资料增加一个文本地址字段，可自由修改
2. **手机号绑定锁**: 手机号绑定后不可修改、不可解绑

---

## 2. Users 表变更

```typescript
// src/types/db-scheme/users.ts
export interface Users {
   _id: string; // openid (微信唯一用户标识)
   name: string; // 用户名
   id: string; // 唯一7位用户ID
   created_at: string; // 创建时间
   phone?: string; // 手机号（绑定后不可更改）
   address?: string; // 新增：地址（简单文本，可随时修改）
}
```

### 字段规则

| 字段      | 绑定后是否可改  | 校验                           |
| --------- | --------------- | ------------------------------ |
| `phone`   | ❌ 不可改       | 云函数端检查已有值，非空则拒绝 |
| `address` | ✅ 可改、可清空 | 无限制，空字符串也允许         |

### 为什么不加 `phone_locked` 字段

`phone` 非空即为已绑定，字段本身已是状态标识。加独立布尔字段会引入同步一致性问题，且无实际收益。KISS。

---

## 3. 云函数 update-profile 变更

文件：`weixin-cloud/update-profile/index.ts`

```typescript
interface UpdateProfileParams {
   phone?: string;
   address?: string; // ← 新增
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

   // 1. phone 绑定保护：已有值则整体拒绝
   if (event.phone !== undefined) {
      if ((existingUser as Record<string, unknown>).phone) {
         return { success: false, message: '手机号已绑定，不可修改' };
      }
      if (!/^1[3-9]\d{9}$/.test(event.phone)) {
         return { success: false, message: '手机号格式不正确' };
      }
      updateData.phone = event.phone;
   }

   // 2. address 自由更新
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

### 设计要点

- phone / address 同时传入时 phone 校验失败 → **整体拒绝**，避免用户以为 phone 已绑定
- address 接受空字符串（用户清空地址的场景）

---

## 4. 前端 edit.vue 变更

文件：`src/pages/profile/edit.vue`

### UI 变化

```
绑定前:                   绑定后:
┌────────────────┐       ┌────────────────┐
│  昵称  微信用户 │       │  昵称  微信用户 │
├────────────────┤       ├────────────────┤
│  手机号 [点击绑定›] │  →  │  手机号 138****0000│  ← 不可点击
├────────────────┤       ├────────────────┤
│  地址   [点击填写›] │  →  │  地址   [xx路xx号›]│  ← 始终可点击
└────────────────┘       └────────────────┘
```

### 状态变量

```typescript
const phone = ref('');
const address = ref(''); // ← 新增
const originalAddress = ref('');
const hasPhone = computed(() => !!phone.value);
const isPhoneLocked = computed(() => !!phone.value); // phone 非空即锁定
```

### 交互逻辑

| 元素     | 绑定前                 | 绑定后                        |
| -------- | ---------------------- | ----------------------------- |
| 手机号行 | 可点击，弹出输入框     | 纯展示，灰色文字，无 `›` 箭头 |
| 地址行   | 始终可点击，弹出输入框 | 同左                          |
| 保存按钮 | 任一字段有变化时启用   | 同左                          |

### userStore 同步

```typescript
// updateUserProfile 方法补上 address 同步
if (result.success && this.user) {
   this.user = {
      ...this.user,
      ...(params.phone !== undefined ? { phone: params.phone } : {}),
      ...(params.address !== undefined ? { address: params.address } : {}),
   };
}
```

---

## 5. API 层类型修正

文件：`src/api/userApi.ts`

```typescript
export interface UpdateProfileParams {
   phone?: string;
   address?: string;
}
```

去掉原有的 `[key: string]: unknown` 泛型索引，用显式字段。

---

## 6. 不动的内容

| 文件                   | 原因                                        |
| ---------------------- | ------------------------------------------- |
| `get-profile/index.ts` | 已返回完整 user 文档，新增字段自动包含      |
| `user-login/index.ts`  | 新用户 phone/address 为 undefined，无需处理 |
| `getCloudProfile()`    | 同 get-profile                              |
| `database-schema.md`   | 同步更新 docs                               |

---

## 7. 变更文件清单

| 文件                                   | 改动类型                       |
| -------------------------------------- | ------------------------------ |
| `src/types/db-scheme/users.ts`         | 新增 `address?: string`        |
| `weixin-cloud/update-profile/index.ts` | phone 绑定保护 + address 支持  |
| `src/pages/profile/edit.vue`           | 地址输入 UI + phone 绑定后只读 |
| `src/stores/modules/userStore.ts`      | address 字段同步               |
| `src/api/userApi.ts`                   | UpdateProfileParams 类型修正   |
| `weixin-cloud/database-schema.md`      | 同步 users 表文档              |

---

## 8. 测试要点

1. **phone 绑定保护**: 未绑定 → 成功；已绑定 → 拒绝（返回明确错误信息）；已绑定 + 传空字符串 → 拒绝
2. **address**: 增/删/改均正常；为空字符串可以保存
3. **混合提交**: phone 绑定失败时 address 也不应写入
4. **前端状态**: 页面 reload 后 phone 锁定状态正确显示
