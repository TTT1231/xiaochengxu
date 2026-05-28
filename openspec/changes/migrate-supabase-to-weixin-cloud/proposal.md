## Why

Supabase 节点部署在东京 (ap-northeast-1)，国内用户访问延迟高，影响小程序加载速度和用户体验。微信云开发是微信生态原生方案，数据库和云函数部署在国内，延迟低且与小程序深度集成。同时迁移过程也是重新审视安全架构的机会——当前客户端直接写入数据库的模式（createOrder、cancelOrder）在微信云中应改为云函数服务端写入。

## What Changes

- **BREAKING**: 移除 `supabase-wechat-stable-v2` 依赖，替换为微信云开发 SDK
- **BREAKING**: 移除 Supabase Auth（JWT + Edge Function 登录），替换为微信云函数原生认证（`getWxContext()`）
- **BREAKING**: 移除 Supabase PostgreSQL，替换为微信云数据库（文档型）
- **BREAKING**: 移除 Supabase Storage，替换为微信云存储
- 移除 Edge Function `wx-login`，用微信云函数实现认证（无需 `wx.login()`）
- 将 PostgreSQL 触发器逻辑（`handle_order_credits`、`update_user_level`）迁移到云函数
- 将客户端直写数据库的操作（订单创建/取消）改为调用云函数
- 迁移现有数据：5 张表 + 2 个 Storage bucket 的数据
- 更新环境变量配置（`VITE_SUPABASE_*` → 微信云配置）
- 更新 `vite.config.ts` 中的环境变量注入 + 更新 `compileWeixinCloud()` 插件支持递归子目录
- 更新类型定义以适配文档型数据库（移除外键依赖的字段类型）
- **BREAKING**: 重写 token 管理逻辑（当前依赖 JWT exp 字段解析）
- **BREAKING**: 移除 H5 平台支持（`wx.cloud.*` API 仅限微信小程序），清理 `manifest.json` 中的 H5 配置
- 配置微信云数据库集合安全规则（客户端仅读 products/categoried，写操作全走云函数）
- 迁移完成后禁用 Supabase 中已部署的 `wx-login` Edge Function（Supabase 项目保留作为回滚后备）

## Capabilities

### New Capabilities
- `weixin-cloud-auth`: 微信云函数认证流程，替代 Supabase Edge Function 的 wx-login（使用 `getWxContext()` 直接获取 OPENID，无需 `wx.login()`）
- `weixin-cloud-database`: 微信云数据库访问层，替代 Supabase PostgreSQL client（含集合安全规则配置）
- `weixin-cloud-storage`: 微信云存储访问层，替代 Supabase Storage（含 fileID 缓存、批量解析、过期刷新）
- `weixin-cloud-functions`: 云函数基础设施（订单处理、积分计算、会员等级更新等业务逻辑，使用 `db.runTransaction()` 保证原子性）

### Modified Capabilities
<!-- 无现有 openspec/specs/ 需要修改 -->

## Impact

**代码文件**（需要修改）:
- `src/utils/supabaseClient.ts` — 替换为微信云数据库 client
- `src/hooks/useEnvConfig.ts` — 环境变量切换
- `src/api/userApi.ts` — 认证流程重写
- `src/api/homeDataApi.ts` — 数据库查询 + 图片 URL 逻辑重写
- `src/api/orderApi.ts` — 改为云函数调用
- `src/stores/modules/userStore.ts` — token 管理重写
- `src/types/db-scheme/` — 类型定义调整（UUID→string, bigint→number, 修正 display ID 注释为 7 位）
- `vite.config.ts` — 环境变量注入更新 + `compileWeixinCloud()` 插件递归支持
- `package.json` — 依赖变更
- `manifest.json` — 移除/禁用 H5 平台配置

**新增文件**:
- `weixin-cloud/` 目录下多个云函数（已有 Vite 编译管道，需更新以支持递归编译）
- 微信云数据库 schema / 初始化脚本

**依赖变更**:
- 移除: `supabase-wechat-stable-v2`
- 新增: `wx-server-sdk`（云函数端）

**数据迁移**:
- 5 张表数据迁移到微信云数据库（`products._id` 保留原数字 ID，`orders._id` 使用 `order_id`）
- 2 个 Storage bucket（products-img、project-icons）迁移到微信云存储
- 历史订单中的 Supabase 图片 URL 需要批量更新
- categoried 表中的完整 Supabase URL 需要批量更新
- 迁移验证：记录数对比 + 关联性校验 + fileID 解析测试 + 重复 ID 检测

**迁移策略**:
- 一次性切换（big bang），适用于当前低用户量开发阶段
- 保留 Supabase 项目运行作为回滚后备，迁移完成后禁用 Edge Function
- 数据迁移在存储资源上传完成后执行，确保 fileID 映射可用
