<script setup lang="ts">
import { ref } from 'vue';

interface BannerSlide {
   id: number;
   badge: string;
   title: string;
   highlight: string;
   subtitle: string;
}

/**
 * 轮播数据 —— 单张时不显示指示点、不自动播放
 * 未来扩展示例：
 *   { id: 2, badge: '新品上市', title: '春季限定', highlight: '尝鲜价', subtitle: '当季新品抢先体验' }
 */
const slides = ref<BannerSlide[]>([
   {
      id: 1,
      badge: '会员特权',
      title: '会员饮品',
      highlight: '8.8 折',
      subtitle: '饮料咖啡尊享会员专属折扣',
   },
]);
</script>

<template>
   <view class="banner-section">
      <view class="swiper-wrapper">
         <swiper
            class="banner-swiper"
            :indicator-dots="slides.length > 1"
            indicator-color="rgba(255, 255, 255, 0.3)"
            indicator-active-color="#ffffff"
            :autoplay="slides.length > 1"
            :interval="4000"
            :circular="slides.length > 1"
         >
            <swiper-item v-for="slide in slides" :key="slide.id">
               <view class="slide-card">
                  <!-- 背景装饰圆圈 -->
                  <view class="deco deco--c1" />
                  <view class="deco deco--c2" />
                  <view class="deco deco--c3" />

                  <!-- 正文内容 -->
                  <view class="slide-body">
                     <!-- 徽章 -->
                     <view class="badge">
                        <text class="badge-text">{{ slide.badge }}</text>
                     </view>

                     <!-- 标题 + 高亮数字 -->
                     <view class="headline">
                        <text class="headline-label">{{ slide.title }}</text>
                        <text class="headline-number">{{ slide.highlight }}</text>
                     </view>

                     <!-- 副标题 -->
                     <text class="subtitle">{{ slide.subtitle }}</text>
                  </view>
               </view>
            </swiper-item>
         </swiper>
      </view>
   </view>
</template>

<style lang="scss" scoped>
/* ── 外容器 ── */
.banner-section {
   padding: 24rpx 28rpx 30rpx;
   background: linear-gradient(180deg, #fffdf9, $bg-page);
}

/* swiper 圆角包裹层：兼容原生组件 border-radius 不生效的问题 */
.swiper-wrapper {
   height: 244rpx;
   border-radius: $radius-xl;
   overflow: hidden;
}

.banner-swiper {
   height: 100%;
}

/* ── 卡片 ── */
.slide-card {
   height: 100%;
   background: linear-gradient(135deg, #713414 0%, #a54f1b 55%, #d48a4c 100%);
   display: flex;
   align-items: center;
   position: relative;
   overflow: hidden;
   padding: 0 40rpx;
   box-shadow: 0 20rpx 42rpx rgba(113, 52, 20, 0.2);
}

/* ── 装饰圆圈 ── */
.deco {
   position: absolute;
   border-radius: 50%;
   border: 4rpx solid rgba(255, 255, 255, 0.1);
   background-color: rgba(255, 255, 255, 0.05);
   pointer-events: none;

   &--c1 {
      width: 260rpx;
      height: 260rpx;
      right: -80rpx;
      top: -100rpx;
   }

   &--c2 {
      width: 140rpx;
      height: 140rpx;
      right: 100rpx;
      bottom: -40rpx;
   }

   &--c3 {
      width: 70rpx;
      height: 70rpx;
      right: 20rpx;
      top: 40rpx;
      border-width: 3rpx;
   }
}

/* ── 正文 ── */
.slide-body {
   position: relative;
   z-index: 2;
   display: flex;
   flex-direction: column;
}

/* 徽章 */
.badge {
   align-self: flex-start;
   background-color: rgba(255, 255, 255, 0.22);
   backdrop-filter: blur(10rpx);
   padding: 6rpx 18rpx;
   border-radius: $radius-full;
   margin-bottom: 20rpx;
}

.badge-text {
   font-size: 20rpx;
   font-weight: 600;
   color: #ffffff;
   line-height: 28rpx;
   letter-spacing: 2rpx;
}

/* 标题行：label + 大数字同行 */
.headline {
   display: flex;
   align-items: baseline;
   gap: 16rpx;
   margin-bottom: 14rpx;
}

.headline-label {
   font-size: 30rpx;
   font-weight: 500;
   color: rgba(255, 255, 255, 0.9);
   line-height: 42rpx;
}

.headline-number {
   font-size: 64rpx;
   font-weight: 800;
   color: #ffffff;
   line-height: 72rpx;
   /* 微阴影增加立体感 */
   text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

/* 副标题 */
.subtitle {
   font-size: 22rpx;
   font-weight: 400;
   color: rgba(255, 255, 255, 0.72);
   line-height: 30rpx;
}
</style>
