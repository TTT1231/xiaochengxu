# 微信小程序平台规则

## 组件标签

禁止使用 HTML 标签，必须使用小程序组件：

| 禁止 | 必须 |
|------|------|
| `div` | `view` |
| `span` | `text` |
| `img` | `image` |

## 尺寸单位

布局一律用 `rpx`，不要用 `px` 做间距/尺寸。750rpx = 屏幕宽度。

## 图片路径

使用 `/static/` 或 `@/static/` 的绝对路径。

## 列表渲染

`v-for` 必须加 `:key`，保证性能。

## 页面生命周期

使用 `@dcloudio/uni-app` 的 `onReady`、`onPageScroll`，不要用 Vue 的 `onMounted`。

## 安全区域

底部间距使用 `env(safe-area-inset-bottom)`。
