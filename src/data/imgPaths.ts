// 基础路径
const BASE_PATH = '/static';
const ICONS_BASE = `${BASE_PATH}/icons`;
const IMAGES_BASE = `${BASE_PATH}/images`;

// 通用图标
export const commonIconsPath = `${ICONS_BASE}/common`;

export const commonIcons = {
   cartWhite: `${commonIconsPath}/cart-white.svg`,
   location: `${commonIconsPath}/location.svg`,
   back: `${commonIconsPath}/back.svg`,
   qrcode: `${commonIconsPath}/qrcode.svg`,
   refresh: `${commonIconsPath}/refresh.svg`,
   search: `${commonIconsPath}/search.svg`,
   customerService: `${commonIconsPath}/customer-service.svg`,
} as const;

// 通用图片
export const commonImages = {
   avatar: `${IMAGES_BASE}/avatar.png`,
   bannerFood: `${IMAGES_BASE}/banner-food.png`,
   emptyOrder: `${IMAGES_BASE}/empty-order.png`,
   store: `${IMAGES_BASE}/store.png`,
} as const;
