<template>
   <view class="stats-container">
      <view class="stat-item" @click="handlePointsClick">
         <text class="stat-label">我的积分</text>
         <view class="stat-value-row">
            <text class="stat-value">{{ formatNumber(points) }}</text>
            <text class="stat-unit">分</text>
         </view>
      </view>
      <view class="stat-item" @click="handleCouponsClick">
         <text class="stat-label">优惠券</text>
         <view class="stat-value-row">
            <text class="stat-value">{{ coupons }}</text>
            <text class="stat-unit">张</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
interface Props {
   points: number;
   coupons: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   (e: 'click:points'): void;
   (e: 'click:coupons'): void;
}>();

const formatNumber = (num: number): string => {
   return num.toLocaleString();
};

const handlePointsClick = () => {
   emit('click:points');
};

const handleCouponsClick = () => {
   emit('click:coupons');
};
</script>

<style lang="scss" scoped>
.stats-container {
   display: flex;
   gap: 24rpx;
}

.stat-item {
   flex: 1;
   background-color: $bg-card;
   border-radius: $radius-lg;
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   padding: 32rpx;
   box-shadow: $shadow-card;
   gap: 12rpx;
   cursor: pointer;

   &:active {
      opacity: 0.7;
   }
}

.stat-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.stat-value-row {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
}

.stat-value {
   font-size: 44rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 60rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.stat-unit {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}
</style>
