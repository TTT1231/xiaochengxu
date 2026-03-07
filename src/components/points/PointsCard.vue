<template>
   <view class="points-card">
      <view class="card-content">
         <text class="label">我的积分</text>
         <text class="points-value">{{ points }}</text>
      </view>
   </view>
</template>

<script setup lang="ts">
interface Props {
   points: number;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.points-card {
   height: 160rpx;
   background: linear-gradient(
      135deg,
      $brand-primary 0%,
      $brand-primary-dark 100%
   );
   border-radius: $radius-lg;
   padding: 32rpx;
   box-shadow: $shadow-card;
   margin: 0 24rpx; /* 添加水平边距 */
}

.card-content {
   display: flex;
   flex-direction: column;
   justify-content: center;
   height: 100%;
}

.label {
   font-size: 28rpx;
   color: rgba(255, 255, 255, 0.9);
   margin-bottom: 8rpx;
}

.points-value {
   font-size: 64rpx;
   font-weight: 700;
   color: #ffffff;
   line-height: 1;
}
</style>
