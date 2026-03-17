<script setup lang="ts">
interface Props {
   points: number;
}

defineProps<Props>();

const emit = defineEmits<{
   detail: [];
}>();
</script>

<template>
   <view class="points-card">
      <view class="decorative-circle"></view>
      <view class="points-icon">
         <image class="icon-image" src="/static/icons/points/star.svg" mode="aspectFit" />
      </view>

      <view class="card-content">
         <text class="label">当前可用积分</text>
         <view class="points-row">
            <text class="points-value">{{ points.toLocaleString() }}</text>
            <text class="points-unit">Points</text>
         </view>
         <view class="detail-btn" @click="emit('detail')">
            <text class="detail-text">积分明细</text>
            <image
               class="arrow-icon"
               src="/static/icons/common/chevron-right-white.svg"
               mode="aspectFit"
            />
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.points-card {
   position: relative;
   background: linear-gradient(156deg, $brand-primary 0%, #f5a663 100%);
   border-radius: $radius-lg;
   padding: 48rpx 32rpx;
   margin: 0 32rpx;
   overflow: hidden;
   box-shadow:
      0px 10px 15px -3px rgba(0, 0, 0, 0.1),
      0px 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.decorative-circle {
   position: absolute;
   right: -64rpx;
   bottom: -64rpx;
   width: 256rpx;
   height: 256rpx;
   background: rgba(255, 255, 255, 0.1);
   border-radius: 50%;
}

.points-icon {
   position: absolute;
   right: 32rpx;
   top: 32rpx;
   width: 100rpx;
   height: 100rpx;
   opacity: 0.3;
}

.icon-image {
   width: 100%;
   height: 100%;
}

.card-content {
   position: relative;
   display: flex;
   flex-direction: column;
   gap: 8rpx;
}

.label {
   font-size: 28rpx;
   color: rgba(255, 255, 255, 0.8);
   line-height: 40rpx;
}

.points-row {
   display: flex;
   align-items: baseline;
   gap: 16rpx;
   margin-bottom: 24rpx;
}

.points-value {
   font-size: 72rpx;
   font-weight: 700;
   color: $uni-text-color-inverse;
   line-height: 80rpx;
   letter-spacing: -1rpx;
}

.points-unit {
   font-size: 28rpx;
   color: rgba(255, 255, 255, 0.9);
   line-height: 40rpx;
}

.detail-btn {
   display: flex;
   align-items: center;
   gap: 8rpx;
   align-self: flex-start;
   padding: 8rpx 20rpx;
   background: rgba(255, 255, 255, 0.2);
   backdrop-filter: blur(2px);
   border-radius: 9999rpx;
}

.detail-text {
   font-size: 28rpx;
   color: $uni-text-color-inverse;
   line-height: 40rpx;
}

.arrow-icon {
   width: 12rpx;
   height: 20rpx;
}
</style>
