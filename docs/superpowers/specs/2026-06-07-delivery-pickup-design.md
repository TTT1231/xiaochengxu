# 配送/自提下单流程设计

- **日期**: 2026-06-07
- **涉及范围**: 购物车页 / Orders 表 / 云函数 create-order / 新增云函数 get-delivery-config / 新增 delivery_config 集合
- **状态**: 定稿

---

## 1. 需求概要

1. **配送方式切换**: 用户在购物车页可选择「到店自提」(默认) 或「商家配送」
2. **配送费规则**: 满 X 元免配送费，未满收 Y 元。X 和 Y 通过数据库配置，管理后台可修改
3. **配送信息校验**: 选择配送时，必须已绑定手机号和填写地址，否则结算按钮置灰
4. **订单备注**: 自提和配送均可选填备注，统一用 `remark` 字段

---

## 2. 方案选择

选用 **方案 A：购物车页切换**。

核心流程：

```
首页加购（不变）
    ↓
进入购物车
    ├─ 默认自提 → 直接结算（和现在完全一致）
    └─ 切换配送 → 展开配送地址面板 → 校验 phone/address
                      ├─ 未绑定 → 按钮置灰，引导去 profile 绑定
                      └─ 已绑定 → 显示配送费 → 可填备注 → 结算
```

---

## 3. 数据库变更

### 3.1 新增集合：`delivery_config`

单行配置表，文档 ID 固定为 `config`。

| 字段             | 类型     | 默认值     | 说明             |
| ---------------- | -------- | ---------- | ---------------- |
| `_id`            | `string` | `'config'` | 固定 ID          |
| `free_threshold` | `number` | `30`       | 满多少元免配送费 |
| `delivery_fee`   | `number` | `8`        | 未满时的配送费   |
| `updated_at`     | `string` | —          | 最后修改时间     |

### 3.2 Orders 表新增字段

| 字段               | 类型                     | 必填       | 说明                         |
| ------------------ | ------------------------ | ---------- | ---------------------------- |
| `delivery_type`    | `'pickup' \| 'delivery'` | 是         | 配送/自提标识，默认 `pickup` |
| `delivery_fee`     | `number`                 | 是         | 配送费（自提为 0）           |
| `remark`           | `string`                 | 否         | 订单备注                     |
| `delivery_address` | `string`                 | 配送时必填 | 下单时的地址快照             |
| `delivery_phone`   | `string`                 | 配送时必填 | 下单时的手机号快照           |

> 地址和手机号存快照而非引用，因为用户后续可能修改 profile，但订单的配送信息应固定为下单时的值。

---

## 4. 配送费计算逻辑

```
if delivery_type === 'pickup':
    delivery_fee = 0
else if total_amount >= free_threshold:
    delivery_fee = 0
else:
    delivery_fee = 8 (来自 delivery_config.delivery_fee)
```

free_threshold 和 delivery_fee 均来自 `delivery_config` 集合。

---

## 5. 云函数

### 5.1 新增：`get-delivery-config`

- **作用**: 读取 `delivery_config` 集合中的配置
- **是否需要鉴权**: 否（所有用户都需要读取）
- **返回**:

```typescript
{
  success: boolean;
  data?: {
    free_threshold: number;
    delivery_fee: number;
  };
  message: string;
}
```

### 5.2 修改：`create-order`

接受新参数：

```typescript
interface CreateOrderParams {
   items: CreateOrderItem[];
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

**安全校验**: 云函数必须根据 `delivery_type` 和 `totalAmount` 重新计算配送费，与前端传入的 `deliveryFee` 比对。不一致则拒绝订单，防止前端篡改。

```typescript
// 云函数侧配送费校验
const config = await db.collection('delivery_config').doc('config').get();
const { free_threshold, delivery_fee: configFee } = config.data;
const expectedFee =
   event.deliveryType === 'pickup' ? 0 : event.totalAmount >= free_threshold ? 0 : configFee;
if (event.deliveryFee !== expectedFee) {
   return { success: false, message: '配送费异常' };
}
```

写入 orders 文档时带上新字段。

---

## 6. 前端变更

### 6.1 购物车页（`src/pages/cart/index.vue`）

**数据获取**: 页面加载时调用 `getDeliveryConfig()` 获取配送费配置。获取失败时使用硬编码默认值（free_threshold=30, delivery_fee=8）兜底，保证核心流程可用。

新增以下 UI 元素：

- **配送方式切换行**: 按钮式切换，默认选中「到店自提」
- **配送地址面板**: 切换配送时展开，展示地址/手机号绑定状态
- **配送费行**: 在费用明细中插入，自提时隐藏
- **备注框**: 可选，标签为「订单备注（选填）」

交互规则：

| 场景                     | 行为                                                     |
| ------------------------ | -------------------------------------------------------- |
| 默认自提                 | 隐形配送费行，和现有流程完全一致                         |
| 切换配送 + 未绑手机/地址 | 展开提醒卡片，结算按钮置灰，文字「完善相关信息后再结算」 |
| 切换配送 + 已绑手机/地址 | 展示配送费行，结算按钮可用                               |

### 6.2 订单详情页（`src/pages/order/detail.vue`）

- 展示 `delivery_type` 标签（🏪 自提 / 🛵 配送）
- 配送时展示 `delivery_address`、`delivery_phone`、`delivery_fee`
- 始终展示 `remark`（如果有）

---

## 7. 类型变更

### `src/types/constants.ts` 新增

```typescript
export type DeliveryType = 'pickup' | 'delivery';
```

### `src/types/db-scheme/orders.ts` Orders 接口新增

```typescript
export interface Orders {
   // ... 现有字段
   delivery_type: DeliveryType;
   delivery_fee: number;
   remark?: string;
   delivery_address?: string;
   delivery_phone?: string;
}
```

---

## 8. 变更文件清单

| 文件                                        | 改动类型                                        |
| ------------------------------------------- | ----------------------------------------------- |
| `src/pages/cart/index.vue`                  | 新增配送切换 UI、地址校验、备注、配送费展示     |
| `src/api/orderApi.ts`                       | `CreateOrderParams` 增加新字段                  |
| `src/types/constants.ts`                    | 新增 `DeliveryType` 类型                        |
| `src/types/db-scheme/orders.ts`             | Orders 接口新增字段                             |
| `weixin-cloud/create-order/index.ts`        | 接受并存储配送相关字段                          |
| `weixin-cloud/get-delivery-config/index.ts` | **新云函数**                                    |
| `src/api/deliveryApi.ts`                    | **新 API 文件**，封装 get-delivery-config 调用  |
| `src/pages/order/detail.vue`                | 展示配送标签、配送费、备注                      |
| 微信云数据库                                | **新建** `delivery_config` 集合，初始化默认文档 |

---

## 9. 不动的内容

| 文件                                   | 原因                                        |
| -------------------------------------- | ------------------------------------------- |
| `src/pages/index/index.vue`            | 首页不变                                    |
| `src/stores/modules/cartStore.ts`      | 配送费计算在组件内完成，不需要 store 层改动 |
| `src/pages/profile/edit.vue`           | 手机号/地址绑定已有独立设计文档，不动       |
| `weixin-cloud/get-profile/index.ts`    | 已返回完整 user 文档                        |
| `weixin-cloud/update-profile/index.ts` | 已有独立设计文档，不动                      |

---

## 10. 测试要点

1. **自提默认流**: 选品 → 进购物车 → 直接结算 → 订单 delivery_type = pickup
2. **配送切换流**: 购物车切配送 → 未绑手机/地址时按钮置灰 → 绑定后 → 显示配送费 → 结算 → 订单有 delivery_address 快照
3. **配送费计算**: 满 free_threshold 免配送费；未满收 delivery_fee
4. **备注**: 自提/配送均可填，订单详情正确展示
5. **地址快照**: 用户结算后修改 profile 地址，已有订单地址不变
6. **配置热更新**: 管理员修改 delivery_config 后，下次获取立即生效（无需重启）
