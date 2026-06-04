/**
 * 颜色工具函数 — 提取自 OrderCard / detail.vue 中重复的 hex 解析逻辑
 */

/** 解析 #rrggbb hex 色值为 { r, g, b }，失败返回灰色兜底 */
export function parseHex(hex: string): { r: number; g: number; b: number } {
   const r = parseInt(hex.slice(1, 3), 16);
   const g = parseInt(hex.slice(3, 5), 16);
   const b = parseInt(hex.slice(5, 7), 16);
   return { r, g, b };
}

/** 将 hex 色值按比例变暗，返回 #rrggbb 格式 */
export function darkenHex(hex: string, factor: number): string {
   const { r, g, b } = parseHex(hex);
   const dr = Math.round(r * factor);
   const dg = Math.round(g * factor);
   const db = Math.round(b * factor);
   return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

/** 生成半透明 rgba 字符串 */
export function hexToRgba(hex: string, alpha: number): string {
   const { r, g, b } = parseHex(hex);
   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
