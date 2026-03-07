<template>
   <view class="reward-card" @click="handleClick">
      <image class="reward-image" :src="reward.image" mode="aspectFill" />
      <view class="reward-content">
         <text class="reward-name">{{ reward.name }}</text>
         <view class="reward-points">
            <text class="points-value">{{ reward.points }}</text>
            <text class="points-unit">积分</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import type { Reward } from '@/types';

interface Props {
   reward: Reward;
}

defineProps<Props>();

const emit = defineEmits<{
   click: [];
}>();

const handleClick = () => {
   emit('click');
};
</script>

<style lang="scss" scoped>
.reward-card {
   display: flex;
   background-color: $bg-card;
   border-radius: $radius-md;
   overflow: hidden;
   box-shadow: $shadow-sm;
   transition: all 0.3s;

   &:active {
      transform: scale(0.98);
   }
}

.reward-image {
   width: 140rpx;
   height: 140rpx;
   flex-shrink: 0;
}

.reward-content {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   padding: 16rpx 20rpx;
}

.reward-name {
   font-size: 28rpx;
   color: $text-primary;
   font-weight: 500;
   line-height: 40rpx;
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
}

.reward-points {
   display: flex;
   align-items: baseline;
}

.points-value {
   font-size: 32rpx;
   color: $brand-primary;
   font-weight: 700;
   margin-right: 4rpx;
}

.points-unit {
   font-size: 22rpx;
   color: $text-muted;
}
</style>
