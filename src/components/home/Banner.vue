<template>
   <view class="banner-section">
      <view class="banner-overlay">
         <!-- 食物图片在右侧 (占33.33%宽度) -->
         <view class="image-container">
            <image
               class="banner-image"
               src="/static/images/banner-food.png"
               mode="aspectFill"
            />
         </view>
         <!-- 渐变背景层 -->
         <view class="gradient-bg">
            <!-- 文字内容在左侧 -->
            <view class="text-content">
               <text class="banner-title">下午茶特惠</text>
               <text class="banner-subtitle">精选甜品+饮品组合 8折起</text>
               <view class="cta-button">
                  <text class="cta-text">立即抢购</text>
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.banner-section {
   padding: 24rpx 32rpx; /* py-[12px] px-[16px] in Figma */
}

.banner-overlay {
   height: 256rpx;
   background-color: rgba(238, 134, 43, 0.1);
   border-radius: 48rpx;
   overflow: hidden;
   position: relative;
}

.image-container {
   position: absolute;
   top: 0;
   right: 0;
   bottom: 0;
   left: 66.67%;
   overflow: hidden;
}

.banner-image {
   position: absolute;
   width: 107.27%;
   height: 100%;
   left: -3.63%;
   top: 0;
}

.gradient-bg {
   position: absolute;
   inset: 0;
   background: linear-gradient(
      90deg,
      rgba(238, 134, 43, 0.2) 0%,
      rgba(238, 134, 43, 0) 100%
   );
   padding: 40rpx; /* p-[20px] in Figma */
   box-sizing: border-box;
   display: flex;
   align-items: center;
}

.text-content {
   display: flex;
   flex-direction: column;
   gap: 8rpx; /* gap-[4px] in Figma */
   max-width: 430rpx;
}

.banner-title {
   font-size: 36rpx;
   font-weight: 500;
   color: #0f172a;
   line-height: 56rpx;
}

.banner-subtitle {
   font-size: 24rpx;
   font-weight: 500;
   color: #475569;
   line-height: 32rpx;
   padding-bottom: 8rpx;
}

.cta-button {
   align-self: flex-start;
   background-color: #ee862b;
   padding: 8rpx 24rpx; /* py-[4px] px-[12px] in Figma */
   border-radius: 9999rpx;
   display: flex;
   align-items: center;
   justify-content: center;
}

.cta-text {
   font-size: 20rpx;
   font-weight: 500;
   color: #ffffff;
   line-height: 30rpx;
   text-align: center;
   width: 80rpx;
}
</style>
