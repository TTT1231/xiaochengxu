/**
 * 图标路径统一管理
 *
 * 所有图标路径集中定义，避免硬编码，便于维护和替换
 */

// ==================== 基础路径 ====================

const BASE_PATH = '/static';
const ICONS_BASE = `${BASE_PATH}/icons`;
const IMAGES_BASE = `${BASE_PATH}/images`;

// ==================== 类型定义 ====================

export interface TabBarItem {
   text: string;
   pagePath: string;
   iconPath: string;
   selectedIconPath: string;
}

export interface MenuIcon {
   key: string;
   icon: string;
   label: string;
}

// ==================== TabBar 图标 ====================

export const commonTabBarImgPaths = `${ICONS_BASE}/tabbar`;

/**
 * tabBar 图标路径数据
 */
export const tabBarImgPaths: TabBarItem[] = [
   {
      text: '首页',
      pagePath: '/pages/index/index',
      iconPath: `${commonTabBarImgPaths}/tab-home.png`,
      selectedIconPath: `${commonTabBarImgPaths}/tab-home-active.png`,
   },
   {
      text: '订单',
      pagePath: '/pages/order/index',
      iconPath: `${commonTabBarImgPaths}/tab-order.png`,
      selectedIconPath: `${commonTabBarImgPaths}/tab-order-active.png`,
   },
   {
      text: '我的',
      pagePath: '/pages/profile/index',
      iconPath: `${commonTabBarImgPaths}/tab-profile.png`,
      selectedIconPath: `${commonTabBarImgPaths}/tab-profile-active.png`,
   },
];

// ==================== 通用图标 ====================

export const commonIconsPath = `${ICONS_BASE}/common`;

/**
 * 通用图标路径
 */
export const commonIcons = {
   // 购物车图标
   cartWhite: `${commonIconsPath}/cart-white.svg`,

   // 定位图标
   location: `${commonIconsPath}/location.svg`,

   // 通知图标
   notification: `${commonIconsPath}/notification.svg`,

   // 下拉箭头
   chevronDown: `${commonIconsPath}/chevron-down.svg`,

   // 返回图标
   back: `${commonIconsPath}/back.svg`,

   // 扫码图标
   scan: `${commonIconsPath}/scan.svg`,

   // 刷新/再来一单图标
   refresh: `${commonIconsPath}/refresh.svg`,

   // 客服图标
   customerService: `${commonIconsPath}/customer-service.svg`,

   // 搜索图标
   search: `${commonIconsPath}/search.svg`,
} as const;

// ==================== 菜单图标 ====================

export const menuIconsPath = `${ICONS_BASE}/menu`;

/**
 * 菜单图标路径（个人中心）
 * 根据原型：我的优惠券、地址管理、系统设置
 */
export const menuIcons: MenuIcon[] = [
   {
      key: 'coupons',
      icon: `${menuIconsPath}/menu-coupons.svg`,
      label: '我的优惠券',
   },
   {
      key: 'address',
      icon: `${menuIconsPath}/menu-address.svg`,
      label: '地址管理',
   },
   {
      key: 'settings',
      icon: `${menuIconsPath}/menu-settings.svg`,
      label: '系统设置',
   },
];

/**
 * 根据菜单 key 获取菜单图标路径
 */
export const getMenuIconByKey = (key: string): string | undefined => {
   return menuIcons.find(item => item.key === key)?.icon;
};

// ==================== 积分商品图片路径 ====================

export const rewardsImagesPath = `${IMAGES_BASE}/rewards`;

/**
 * 积分商品图片路径映射
 * 优惠券类统一使用 coupon-placeholder.png
 * 礼品类统一使用 gift-placeholder.png
 */
export const rewardImages = {
   // 优惠券类 - 统一使用橙色占位图
   milkTeaCoupon: `${rewardsImagesPath}/coupon-placeholder.png`,
   fruitTeaCoupon: `${rewardsImagesPath}/coupon-placeholder.png`,
   coffeeCoupon: `${rewardsImagesPath}/coupon-placeholder.png`,
   dessertCoupon: `${rewardsImagesPath}/coupon-placeholder.png`,
   iceCreamCoupon: `${rewardsImagesPath}/coupon-placeholder.png`,
   // 礼品类 - 统一使用蓝色占位图
   mug: `${rewardsImagesPath}/gift-placeholder.png`,
   bag: `${rewardsImagesPath}/gift-placeholder.png`,
   keychain: `${rewardsImagesPath}/gift-placeholder.png`,
   doublePoints: `${rewardsImagesPath}/gift-placeholder.png`,
   birthdayGift: `${rewardsImagesPath}/gift-placeholder.png`,
} as const;

// ==================== 通用图片路径 ====================

/**
 * 通用图片路径（如空状态、占位图等）
 */
export const commonImages = {
   avatar: `${IMAGES_BASE}/avatar.png`,
   bannerFood: `${IMAGES_BASE}/banner-food.png`,
   emptyOrder: `${IMAGES_BASE}/empty-order.png`,
   store: `${IMAGES_BASE}/store.png`,
} as const;

// ==================== 工具函数 ====================

/**
 * 获取完整的静态资源路径
 * @param path 相对路径（如 'icons/common/add.svg'）
 * @returns 完整路径（如 '/static/icons/common/add.svg'）
 */
export const getStaticPath = (path: string): string => {
   return path.startsWith('/') ? path : `${BASE_PATH}/${path}`;
};
