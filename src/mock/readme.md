# Mock 数据结构说明

本文档描述甜品点单小程序的模拟数据结构。

---

## 数据表结构

### 1. 商品表 (products)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| name | string | 商品名称 |
| description | string | 商品描述 |
| price | number | 价格（单位：元） |
| image | string | 图片路径 |
| categoryId | string | 分类ID |

### 2. 分类表 (categories)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类ID |
| name | string | 分类名称 |
| icon | string | 图标路径 |

### 3. 订单表 (orders)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 订单ID |
| orderNo | string | 订单号 |
| storeName | string | 门店名称 |
| storeImage | string | 门店图片 |
| status | OrderStatus | 订单状态 |
| items | OrderItem[] | 商品列表 |
| totalAmount | number | 总金额 |
| discountAmount | number | 优惠金额 |
| createdAt | string | 创建时间 |
| estimatedTime | string | 预计时间（可选） |

**订单状态 (OrderStatus)**:
- `pending`: 待处理
- `preparing`: 制作中
- `ready`: 待取餐
- `completed`: 已完成

### 4. 用户表 (user)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| memberLevel | string | 会员等级 |
| points | number | 积分 |
| coupons | number | 优惠券数量 |

### 5. 积分商品表 (rewards)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 商品ID |
| name | string | 商品名称 |
| image | string | 图片URL |
| points | number | 所需积分 |
| category | string | 分类 |

---

## 数据关系

```
Category (1) ─────< Product (N)
      │
      └─ 分类包含多个商品

User (1) ─────< Order (N)
      │
      └─ 用户有多个订单

User (1) ─────< Reward (N)
      │
      └─ 用户可兑换多个积分商品
```
