<script setup lang="ts">
import { commonIcons } from '@/data/imgPaths';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

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
   storeName: '南昌红谷滩店',
});

const { menuTop, menuHeight, menuRight } = useHeaderHeight();

const icons = {
   location: commonIcons.location,
   qrcode: commonIcons.qrcode,
   back: commonIcons.back,
};

const handleBack = (): void => {
   uni.navigateBack();
};
const handleLocationClick = (): void => {
   // TODO: 门店选择
};
const handleQrcodeClick = (): void => {
   // TODO: 扫码功能
};
</script>

<template>
   <view class="header" :style="{ paddingTop: menuTop + 'px' }">
      <template v-if="mode === 'home'">
         <view class="home-header-content">
            <view
               class="top-bar"
               :style="{ height: menuHeight + 'px', paddingRight: menuRight + 'px' }"
            >
               <view class="location-selector" @click="handleLocationClick">
                  <image class="location-icon" :src="icons.location" mode="aspectFit" />
                  <text class="location-text">{{ storeName }}</text>
               </view>
               <view class="top-icons">
                  <view
                     class="icon-btn"
                     @click="handleQrcodeClick"
                     :style="{ width: menuHeight + 'px', height: menuHeight + 'px' }"
                  >
                     <image class="qrcode-icon" :src="icons.qrcode" mode="aspectFit" />
                  </view>
               </view>
            </view>
         </view>
      </template>

      <template v-else>
         <view class="simple-header" :style="{ height: menuHeight + 'px' }">
            <view v-if="showBack" class="back-btn" @click="handleBack">
               <image class="back-icon" :src="icons.back" mode="aspectFit" />
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
   padding-bottom: 20rpx;
   box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
   border-bottom-left-radius: 32rpx;
   border-bottom-right-radius: 32rpx;
}

.home-header-content {
   padding: 0 32rpx;
   display: flex;
   flex-direction: column;
   gap: 0;
}

.top-bar {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 24rpx;
}

.location-selector {
   display: flex;
   align-items: center;
   gap: 12rpx;
   padding: 8rpx 16rpx 8rpx 0;
}

.location-icon {
   width: 36rpx;
   height: 36rpx;
}

.location-text {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   max-width: 320rpx;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   line-height: 44rpx;
}

.top-icons {
   display: flex;
   align-items: center;
   gap: 24rpx;
}

.icon-btn {
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: $bg-card;
   border: 2rpx solid $border-light;
   border-radius: 50%;
   box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
   transition: all 0.2s ease;

   &:active {
      background-color: $bg-hover;
      transform: scale(0.96);
   }
}

.qrcode-icon {
   width: 32rpx;
   height: 32rpx;
   opacity: 0.85;
}

.simple-header {
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0 24rpx;
   position: relative;
}

.back-btn {
   position: absolute;
   left: 24rpx;
   height: 100%;
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
