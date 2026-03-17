<script setup lang="ts">
import type { Reward } from '@/types';

interface Props {
   reward: Reward;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   exchange: [reward: Reward];
}>();

const handleExchange = () => {
   emit('exchange', props.reward);
};
</script>

<template>
   <view class="reward-card">
      <view class="image-wrapper">
         <image class="reward-image" :src="reward.image" mode="aspectFill" />
      </view>
      <view class="reward-content">
         <text class="reward-name">{{ reward.name }}</text>
         <view class="reward-points">
            <view class="points-icon"></view>
            <text class="points-value">{{ reward.points }} 积分</text>
         </view>
         <view class="exchange-btn" @click="handleExchange">
            <text class="exchange-text">立即兑换</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.reward-card {
   background-color: $bg-card;
   border-radius: $radius-md;
   overflow: hidden;
   box-shadow: $shadow-sm;
   width: 100%;
}

.image-wrapper {
   width: 100%;
   position: relative;
   padding-bottom: 100%;
   background-color: #f5f5f5;
}

.reward-image {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: block;
}

.reward-content {
   display: flex;
   flex-direction: column;
   gap: 12rpx;
   padding: 16rpx;
}

.reward-name {
   font-size: 28rpx;
   color: $text-primary;
   font-weight: 500;
   line-height: 44rpx;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.reward-points {
   display: flex;
   align-items: center;
   gap: 8rpx;
}

.points-icon {
   width: 20rpx;
   height: 20rpx;
   border-radius: 50%;
   background-color: $brand-primary;
   position: relative;

   &::after {
      content: 'P';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12rpx;
      color: white;
      font-weight: bold;
   }
}

.points-value {
   font-size: 28rpx;
   color: $brand-primary;
   font-weight: 600;
   line-height: 40rpx;
}

.exchange-btn {
   margin-top: 8rpx;
   padding: 12rpx 0;
   background-color: $brand-primary;
   border-radius: 32rpx;
   display: flex;
   align-items: center;
   justify-content: center;
}

.exchange-text {
   font-size: 24rpx;
   color: $uni-text-color-inverse;
   font-weight: 500;
   line-height: 32rpx;
}
</style>
