<template>
   <view class="banner-section">
      <view class="banner-box">
         <!-- 左侧文字内容 -->
         <view class="text-content">
            <text class="banner-title">下午茶特惠</text>
            <text class="banner-subtitle">精选甜品+饮品组合 8折起</text>
            <view class="cta-button">
               <text class="cta-text">立即抢购</text>
            </view>
         </view>
         <!-- 右侧图片 -->
         <view class="img-wrapper">
            <image
               class="banner-image"
               src="/static/images/banner-food.png"
               mode="aspectFill"
            />
         </view>
      </view>
   </view>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.banner-section {
   padding: 16rpx 32rpx 24rpx;
   background-color: #ffffff; /* 与 Header 的白底无缝衔接 */
}

.banner-box {
   height: 220rpx;
   background-color: #fcece3; /* 原型中的浅橘色底色 */
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
   color: #333333;
   line-height: 48rpx;
   margin-bottom: 8rpx;
}

.banner-subtitle {
   font-size: 24rpx;
   color: #666666;
   line-height: 34rpx;
   margin-bottom: 24rpx;
}

.cta-button {
   align-self: flex-start;
   background-color: #ef822b;
   padding: 10rpx 28rpx;
   border-radius: 99rpx;
}

.cta-text {
   font-size: 22rpx;
   font-weight: 500;
   color: #ffffff;
   line-height: 30rpx;
}

.img-wrapper {
   width: 45%; /* 稳定图片占比，防止不同屏幕尺寸下 flex 撑开失效出现纯色块 */
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
