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

export interface IconPair {
   icon: string;
   activeIcon: string;
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

// ==================== 分类图标 ====================

export const categoryIconsPath = `${ICONS_BASE}/category`;

/**
 * 分类图标对（默认 + 激活状态）
 */
export const categoryIcons: Record<string, IconPair> = {
   recommend: {
      icon: `${categoryIconsPath}/recommend.svg`,
      activeIcon: `${categoryIconsPath}/recommend-active.svg`,
   },
   cake: {
      icon: `${categoryIconsPath}/cake.svg`,
      activeIcon: `${categoryIconsPath}/cake-active.svg`,
   },
   coffee: {
      icon: `${categoryIconsPath}/coffee.svg`,
      activeIcon: `${categoryIconsPath}/coffee-active.svg`,
   },
   snack: {
      icon: `${categoryIconsPath}/snack.svg`,
      activeIcon: `${categoryIconsPath}/snack-active.svg`,
   },
   gift: {
      icon: `${categoryIconsPath}/gift.svg`,
      activeIcon: `${categoryIconsPath}/gift-active.svg`,
   },
};

// ==================== 通用图标 ====================

export const commonIconsPath = `${ICONS_BASE}/common`;

/**
 * 通用图标路径
 */
export const commonIcons = {
   // 搜索图标
   search: `${commonIconsPath}/search.svg`,
   searchActive: `${commonIconsPath}/search-active.svg`,

   // 购物车图标
   cart: `${commonIconsPath}/cart-active.svg`,
   cartWhite: `${commonIconsPath}/cart-white.svg`,

   // 添加/删除图标
   add: `${commonIconsPath}/add.svg`,
   addActive: `${commonIconsPath}/add-active.svg`,

   // 定位图标
   location: `${commonIconsPath}/location.svg`,
   locationActive: `${commonIconsPath}/location-active.svg`,

   // 通知图标
   notification: `${commonIconsPath}/notification.svg`,
   notificationActive: `${commonIconsPath}/notification-active.svg`,

   // 下拉箭头
   chevronDown: `${commonIconsPath}/chevron-down.svg`,
   chevronDownActive: `${commonIconsPath}/chevron-down-active.svg`,

   // 返回图标
   back: `${commonIconsPath}/back.png`,

   // 扫码图标
   scan: `${commonIconsPath}/scan.svg`,
} as const;

// ==================== 菜单图标 ====================

export const menuIconsPath = `${ICONS_BASE}/menu`;

/**
 * 菜单图标路径
 */
export const menuIcons: MenuIcon[] = [
   {
      key: 'points',
      icon: `${menuIconsPath}/menu-points.png`,
      label: '我的积分',
   },
   {
      key: 'coupons',
      icon: `${menuIconsPath}/menu-coupons.png`,
      label: '优惠券',
   },
   {
      key: 'address',
      icon: `${menuIconsPath}/menu-address.png`,
      label: '收货地址',
   },
   {
      key: 'settings',
      icon: `${menuIconsPath}/menu-settings.png`,
      label: '设置',
   },
   {
      key: 'about',
      icon: `${menuIconsPath}/menu-about.png`,
      label: '关于我们',
   },
];

/**
 * 根据菜单 key 获取菜单图标路径
 */
export const getMenuIconByKey = (key: string): string | undefined => {
   return menuIcons.find(item => item.key === key)?.icon;
};

// ==================== 商品图片路径 ====================

export const productsImagesPath = `${IMAGES_BASE}/products`;

/**
 * 商品图片路径映射（按文件名）
 */
export const productImages = {
   chocolateCake: `${productsImagesPath}/chocolate-cake.png`,
   strawberryTart: `${productsImagesPath}/strawberry-tart.png`,
   saltCaramelLatte: `${productsImagesPath}/salt-caramel-latte.png`,
   mapleCroissant: `${productsImagesPath}/maple-croissant.png`,
   tiramisu: `${productsImagesPath}/tiramisu.png`,
   mangoPancake: `${productsImagesPath}/mango-pancake.png`,
   matchaCake: `${productsImagesPath}/matcha-cake.png`,
   mangoPomelo: `${productsImagesPath}/mango-pomelo.png`,
   pearlMilkTea: `${productsImagesPath}/pearl-milk-tea.png`,
   grapeTea: `${productsImagesPath}/grape-tea.png`,
   cookies: `${productsImagesPath}/cookies.png`,
   macaron: `${productsImagesPath}/macaron.png`,
   afternoonTea: `${productsImagesPath}/afternoon-tea.png`,
   birthdayCake: `${productsImagesPath}/birthday-cake.png`,
   americano: `${productsImagesPath}/americano.png`,
   latte: `${productsImagesPath}/latte.png`,
   redBeanMilkTea: `${productsImagesPath}/red-bean-milk-tea.png`,
   signatureMilkTea: `${productsImagesPath}/signature-milk-tea.png`,
   orangeTea: `${productsImagesPath}/orange-tea.png`,
   strawberryTea: `${productsImagesPath}/strawberry-tea.png`,
   taroMilkTea: `${productsImagesPath}/taro-milk-tea.png`,
   vanillaIceCream: `${productsImagesPath}/vanilla-ice-cream.png`,
   matchaIceCream: `${productsImagesPath}/matcha-ice-cream.png`,
   mangoPomeloAlt: `${productsImagesPath}/yangzhi-ganlu.png`,
} as const;

// ==================== 积分商品图片路径 ====================

export const rewardsImagesPath = `${IMAGES_BASE}/rewards`;

/**
 * 积分商品图片路径映射
 */
export const rewardImages = {
   milkTeaCoupon: `${rewardsImagesPath}/milk-tea-coupon.png`,
   fruitTeaCoupon: `${rewardsImagesPath}/fruit-tea-coupon.png`,
   coffeeCoupon: `${rewardsImagesPath}/coffee-coupon.png`,
   dessertCoupon: `${rewardsImagesPath}/dessert-coupon.png`,
   iceCreamCoupon: `${rewardsImagesPath}/ice-cream-coupon.png`,
   mug: `${rewardsImagesPath}/mug.png`,
   bag: `${rewardsImagesPath}/bag.png`,
   keychain: `${rewardsImagesPath}/keychain.png`,
   doublePoints: `${rewardsImagesPath}/double-points.png`,
   birthdayGift: `${rewardsImagesPath}/birthday-gift.png`,
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

/**
 * 根据分类 ID 获取分类图标对
 * @param categoryId 分类 ID
 * @returns 图标对（包含 icon 和 activeIcon）
 */
export const getCategoryIcons = (categoryId: string): IconPair | undefined => {
   const iconMap: Record<string, keyof typeof categoryIcons> = {
      'cat-1': 'recommend',
      'cat-2': 'cake',
      'cat-3': 'coffee',
      'cat-4': 'snack',
      'cat-5': 'gift',
   };
   const iconKey = iconMap[categoryId];
   return iconKey ? categoryIcons[iconKey] : undefined;
};
