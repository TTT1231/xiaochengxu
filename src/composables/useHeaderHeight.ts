/**
 * 计算 Header 高度的 composable
 * 用于统一处理微信小程序胶囊按钮和状态栏高度
 */

import type { Ref } from 'vue';
import { ref } from 'vue';

interface HeaderHeightResult {
   headerHeight: Ref<number>;
   statusBarHeight: Ref<number>;
   menuTop: Ref<number>;
   menuHeight: Ref<number>;
   menuRight: Ref<number>;
}

/**
 * 获取 Header 相关高度信息
 * @param paddingBottom - Header 底部 padding，默认 20rpx
 */
export function useHeaderHeight(paddingBottomRpx = 20): HeaderHeightResult {
   const headerHeight = ref(0);
   const statusBarHeight = ref(0);
   const menuTop = ref(0);
   const menuHeight = ref(32);
   const menuRight = ref(0);

   const calculateHeights = () => {
      const windowInfo = uni.getSystemInfoSync();
      const sbHeight = windowInfo.statusBarHeight || 0;
      let mTop = sbHeight;
      let mHeight = 32;
      let mRight = 0;

      // #ifdef MP-WEIXIN
      try {
         const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
         mTop = menuButtonInfo.top;
         mHeight = menuButtonInfo.height;
         mRight = windowInfo.windowWidth - menuButtonInfo.left;
      } catch {
         // 使用默认值
      }
      // #endif

      statusBarHeight.value = sbHeight;
      menuTop.value = mTop;
      menuHeight.value = mHeight;
      menuRight.value = mRight;

      // 计算 Header 高度: paddingTop(menuTop) + menuHeight + padding-bottom
      const paddingBottomPx = Math.ceil(uni.upx2px(paddingBottomRpx));
      headerHeight.value = mTop + mHeight + paddingBottomPx;
   };

   // 初始化时计算一次
   calculateHeights();

   return {
      headerHeight,
      statusBarHeight,
      menuTop,
      menuHeight,
      menuRight,
   };
}
