<script setup lang="ts">
interface TabItem {
   text: string;
   pagePath: string;
   iconPath: string;
   selectedIconPath: string;
}

const TABBAR_ICONS = '/static/icons/tabbar';

const tabs: TabItem[] = [
   {
      text: '首页',
      pagePath: '/pages/index/index',
      iconPath: `${TABBAR_ICONS}/tab-home.png`,
      selectedIconPath: `${TABBAR_ICONS}/tab-home-active.png`,
   },
   {
      text: '订单',
      pagePath: '/pages/order/index',
      iconPath: `${TABBAR_ICONS}/tab-order.png`,
      selectedIconPath: `${TABBAR_ICONS}/tab-order-active.png`,
   },
   {
      text: '我的',
      pagePath: '/pages/profile/index',
      iconPath: `${TABBAR_ICONS}/tab-profile.png`,
      selectedIconPath: `${TABBAR_ICONS}/tab-profile-active.png`,
   },
];

interface Props {
   current?: number;
}

const props = withDefaults(defineProps<Props>(), {
   current: 0,
});

function handleTabClick(index: number, pagePath: string): void {
   if (index === props.current) return;
   uni.switchTab({ url: pagePath });
}
</script>

<template>
   <view class="tab-bar">
      <view
         v-for="(tab, index) in tabs"
         :key="tab.pagePath"
         class="tab-item"
         :class="{ active: current === index }"
         @click="handleTabClick(index, tab.pagePath)"
      >
         <view class="tab-icon">
            <image
               :src="current === index ? tab.selectedIconPath : tab.iconPath"
               class="icon"
               mode="aspectFit"
            />
         </view>
         <text class="tab-text">{{ tab.text }}</text>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.tab-bar {
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   height: 128rpx;
   display: flex;
   background-color: $bg-card;
   border-top: 1rpx solid $bg-input;
   padding-bottom: constant(safe-area-inset-bottom);
   padding-bottom: env(safe-area-inset-bottom);
   z-index: 999;
}

.tab-item {
   flex: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 8rpx;
   padding: 18rpx 0 32rpx;

   &.active {
      .tab-text {
         color: $brand-primary;
      }
   }
}

.tab-icon {
   width: 36rpx;
   height: 40rpx;

   .icon {
      width: 100%;
      height: 100%;
   }
}

.tab-text {
   font-size: 20rpx;
   color: $text-muted;
   line-height: 30rpx;
   transition: color 0.2s;
}
</style>
