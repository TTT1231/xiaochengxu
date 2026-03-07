<template>
   <view class="stats-card">
      <view class="stat-item" @click="handlePointsClick">
         <text class="stat-value">{{ points }}</text>
         <text class="stat-label">积分</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="handleCouponsClick">
         <text class="stat-value">{{ coupons }}</text>
         <text class="stat-label">优惠券</text>
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

const handlePointsClick = () => {
   emit('click:points');
};

const handleCouponsClick = () => {
   emit('click:coupons');
};
</script>

<style lang="scss" scoped>
.stats-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   display: flex;
   align-items: center;
   padding: 32rpx 0;
}

.stat-item {
   flex: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 8rpx;
   cursor: pointer;

   &:active {
      opacity: 0.7;
   }
}

.stat-value {
   font-size: 44rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 60rpx;
}

.stat-label {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}

.stat-divider {
   width: 1rpx;
   height: 60rpx;
   background-color: $border-light;
}
</style>
