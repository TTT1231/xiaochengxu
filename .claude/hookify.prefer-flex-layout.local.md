---
name: prefer-flex-layout
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(vue|css|scss)$
  - field: new_text
    operator: regex_match
    pattern: display\s*:\s*grid
---

⚠️ **Grid 布局检测到！**

请优先使用 **Flexbox 布局**，Grid 布局仅在必要时使用。

**推荐使用 Flexbox 的场景：**
- 一维布局（行或列）
- 组件内部元素排列
- 导航栏、卡片、列表项
- 居中对齐、等分空间

**Grid 布局适用场景（例外情况）：**
- 二维布局（行列同时控制）
- 复杂表单布局
- 仪表盘/看板布局
- 图片画廊（不规则尺寸）

**为什么优先 Flexbox：**
- 微信小程序兼容性更好
- 大多数布局需求 Flexbox 足够
- 代码更简洁，维护成本更低
- 响应式处理更直观

**示例转换：**
```css
/* ❌ Grid 方式 */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 24rpx;

/* ✅ Flex 方式 */
display: flex;
flex-wrap: wrap;
gap: 24rpx;
```
```css
/* 子元素 */
width: calc((100% - 24rpx) / 2);
```
