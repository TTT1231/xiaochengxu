<script setup lang="ts"></script>

<template>
   <view class="banner-section">
      <view class="banner-box">
         <view class="text-content">
            <text class="banner-title">下午茶特惠</text>
            <text class="banner-subtitle">精选甜品+饮品组合 8折起</text>
            <view class="cta-button">
               <text class="cta-text">立即抢购</text>
            </view>
         </view>
         <view class="img-wrapper">
            <image class="banner-image" src="/static/images/banner-food.png" mode="aspectFill" />
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.banner-section {
   padding: 16rpx 32rpx 24rpx;
   background-color: $bg-card;
}

.banner-box {
   height: 220rpx;
   background-color: $brand-primary-light;
   border-radius: 32rpx;
   display: flex;
   align-items: stretch;
   overflow: hidden;
}

.text-content {
   width: 55%;
   display: flex;
   flex-direction: column;
   justify-content: center;
   padding-left: 36rpx;
   padding-right: 16rpx;
   box-sizing: border-box;
}

.banner-title {
   font-size: 34rpx;
   font-weight: 500;
   color: $text-primary;
   line-height: 48rpx;
   margin-bottom: 8rpx;
}

.banner-subtitle {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
   margin-bottom: 24rpx;
}

.cta-button {
   align-self: flex-start;
   background-color: $brand-primary;
   padding: 10rpx 28rpx;
   border-radius: $radius-full;
}

.cta-text {
   font-size: 22rpx;
   font-weight: 500;
   color: $uni-text-color-inverse;
   line-height: 30rpx;
}

.img-wrapper {
   width: 45%;
   height: 100%;
   position: relative;
   overflow: hidden;
}

.banner-image {
   width: 100%;
   height: 100%;
   display: block;
}
</style>
