---
name: warn-inline-css-in-html
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.html$
  - field: new_text
    operator: regex_match
    pattern: style="[^\"]*"
---

⚠️ **HTML 中检测到内联 CSS (`style="..."`)**

根据项目 CSS 规则，禁止在 HTML 中使用内联样式。

**要求：**
- 使用外链 CSS 文件
- CSS 文件名必须与 HTML 文件名保持一致（例如 `index.html` → `index.css`）

**操作：**
1. 将内联样式提取到对应的 CSS 文件中
2. 用 class 替代 `style="..."` 属性
3. 确保 CSS 文件名与 HTML 文件名匹配
