<script setup lang="ts">
import { commonIcons } from '@/data/imgPaths';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

interface Props {
   mode?: 'home' | 'simple';
   title?: string;
   showBack?: boolean;
}

withDefaults(defineProps<Props>(), {
   mode: 'simple',
   title: '',
   showBack: true,
});

const { menuTop, menuHeight, menuRight } = useHeaderHeight();

const icons = {
   back: commonIcons.back,
};

const handleBack = (): void => {
   uni.navigateBack();
};
</script>

<template>
   <view class="header" :style="{ paddingTop: menuTop + 'px' }">
      <template v-if="mode === 'home'">
         <view
            class="home-header-spacer"
            :style="{ height: menuHeight + 'px', paddingRight: menuRight + 'px' }"
         />
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

.home-header-spacer {
   padding: 0 32rpx;
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
