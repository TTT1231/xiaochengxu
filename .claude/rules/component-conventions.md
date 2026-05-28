# 组件规范

## easycom 自动导入

匹配以下模式的组件会自动导入，无需手动 import：

- `uni-*` → `@dcloudio/uni-ui` 组件
- `@/components/` 下的自定义组件会自动注册

禁止手动 import 已匹配 easycom 模式的组件。

## 组件放置位置

组件按功能模块组织，按以下规则放置：

| 范围         | 目录                 |
| ------------ | -------------------- |
| 公共共享组件 | `components/common/` |
| 页面专用组件 | `components/<功能>/` |

## 页面命名规范

- 页面文件路径：`src/pages/<功能>/index.vue`
- 路由路径：`pages/<功能>/index`
