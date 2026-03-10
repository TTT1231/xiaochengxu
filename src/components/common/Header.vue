<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
   mode?: 'home' | 'simple';
   title?: string;
   showBack?: boolean;
   storeName?: string;
}

withDefaults(defineProps<Props>(), {
   mode: 'simple',
   title: '',
   showBack: true,
   storeName: '上海静安嘉里中心店',
});

const statusBarHeight = ref(0);

onMounted(() => {
   const windowInfo = uni.getWindowInfo();
   statusBarHeight.value = windowInfo.statusBarHeight || 0;
});

const handleBack = () => {
   uni.navigateBack({
      delta: 1,
   });
};

const handleLocationClick = () => {
   // TODO: Implement location selector
};

const handleNotificationClick = () => {
   // TODO: Navigate to notifications
};

const handleScanClick = () => {
   // TODO: Implement QR scan
};
</script>

<template>
   <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 首页模式：门店 + 图标 + 搜索栏 -->
      <template v-if="mode === 'home'">
         <view class="home-header-content">
            <view class="top-bar">
               <view class="location-selector" @click="handleLocationClick">
                  <image
                     class="location-icon"
                     src="/static/icons/common/location.svg"
                     mode="aspectFit"
                  />
                  <text class="location-text">{{ storeName }}</text>
                  <image
                     class="arrow-icon"
                     src="/static/icons/common/chevron-down.svg"
                     mode="aspectFit"
                  />
               </view>
               <view class="top-icons">
                  <view class="icon-btn" @click="handleNotificationClick">
                     <image
                        class="notification-icon"
                        src="/static/icons/common/notification.svg"
                        mode="aspectFit"
                     />
                  </view>
                  <view class="icon-btn" @click="handleScanClick">
                     <image
                        class="scan-icon"
                        src="/static/icons/common/scan.svg"
                        mode="aspectFit"
                     />
                  </view>
               </view>
            </view>
            <view class="search-bar">
               <image class="search-icon" src="/static/icons/common/search.svg" mode="aspectFit" />
               <text class="search-placeholder">搜索美味点心或饮品</text>
            </view>
         </view>
      </template>

      <!-- 普通页面模式：返回按钮 + 标题 -->
      <template v-else>
         <view class="simple-header">
            <view v-if="showBack" class="back-btn" @click="handleBack">
               <image class="back-icon" src="/static/icons/common/back.svg" mode="aspectFit" />
            </view>
            <text class="header-title">{{ title }}</text>
            <view class="right-slot">
               <slot name="right" />
            </view>
         </view>
      </template>
   </view>
</template>

<style lang="scss" scoped>
.header {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   background-color: $bg-card;
   z-index: 999;
}

// ========== 首页模式 ==========
.home-header-content {
   padding: 32rpx 32rpx 16rpx;
   display: flex;
   flex-direction: column;
   gap: 32rpx;
}

.top-bar {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.location-selector {
   display: flex;
   align-items: center;
   gap: 16rpx;
}

.location-icon {
   width: 32rpx;
   height: 40rpx;
}

.location-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   max-width: 300rpx;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   line-height: 40rpx;
}

.arrow-icon {
   width: 12rpx;
   height: 7.4rpx;
}

.top-icons {
   display: flex;
   align-items: center;
   gap: 24rpx;
}

.icon-btn {
   width: 80rpx;
   height: 80rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: $bg-input;
   border-radius: 50%;
}

.notification-icon {
   width: 32rpx;
   height: 40rpx;
}

.scan-icon {
   width: 40rpx;
   height: 40rpx;
}

.search-bar {
   display: flex;
   align-items: center;
   padding: 16rpx 24rpx 16rpx 80rpx;
   background-color: $bg-input;
   border-radius: 48rpx;
   position: relative;
}

.search-icon {
   position: absolute;
   left: 24rpx;
   width: 21rpx;
   height: 21rpx;
}

.search-placeholder {
   font-size: 28rpx;
   color: $text-muted;
   line-height: 1;
}

// ========== 普通模式 ==========
.simple-header {
   display: flex;
   align-items: center;
   justify-content: center;
   height: 88rpx;
   padding: 0 24rpx;
   position: relative;
}

.back-btn {
   position: absolute;
   left: 24rpx;
   width: 64rpx;
   height: 64rpx;
   display: flex;
   align-items: center;
   justify-content: center;
}

.back-icon {
   width: 24rpx;
   height: 40rpx;
}

.header-title {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 44rpx;
}

.right-slot {
   position: absolute;
   right: 24rpx;
   display: flex;
   align-items: center;
}
</style>
