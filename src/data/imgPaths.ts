const BASE_PATH = '/static';
const ICONS_BASE = `${BASE_PATH}/icons`;
const IMAGES_BASE = `${BASE_PATH}/images`;

// 通用图标
export const commonIconsPath = `${ICONS_BASE}/common`;

// 分类图标
export const categoryIconsPath = `${ICONS_BASE}/project`;

export const commonIcons = {
   cartWhite: `${commonIconsPath}/cart-white.svg`,
   location: `${commonIconsPath}/location.svg`,
   back: `${commonIconsPath}/back.svg`,
   qrcode: `${commonIconsPath}/qrcode.svg`,
   refresh: `${commonIconsPath}/refresh.svg`,
   search: `${commonIconsPath}/search.svg`,
   customerService: `${commonIconsPath}/customer-service.svg`,
} as const;

/**
 * 将数据库中的图标名称（如 "cake" 或 "cake.svg"）解析为本地图标完整路径。
 * active 图标自动追加 "-active" 后缀。
 */
export function resolveCategoryIcon(name: string): string {
   if (!name) return '';
   const base = name.replace(/\.svg$/, '');
   return `${categoryIconsPath}/${base}.svg`;
}

export function resolveCategoryActiveIcon(name: string): string {
   if (!name) return '';
   const base = name.replace(/\.svg$/, '');
   // 防止数据库已存 "-active" 后缀导致重复拼接
   if (base.endsWith('-active')) {
      return `${categoryIconsPath}/${base}.svg`;
   }
   return `${categoryIconsPath}/${base}-active.svg`;
}

// 通用图片
export const commonImages = {
   avatar: `${IMAGES_BASE}/avatar.png`,
   bannerFood: `${IMAGES_BASE}/banner-food.png`,
   emptyOrder: `${IMAGES_BASE}/empty-order.png`,
   store: `${IMAGES_BASE}/store.png`,
} as const;
