<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { Products } from '@/types';
import { useHomeStore, useCartStore } from '@/stores';

const homeStore = useHomeStore();
const cartStore = useCartStore();

const product = ref<Products | null>(null);
const currentSlide = ref(0);
const selectedSpecs = ref<Record<string, string>>({});

/** 轮播图图片列表：解析 images 字段（用 & 分隔） */
const carouselImages = computed(() => {
   if (!product.value?.images) return [];
   return product.value.images.split('&').filter(Boolean);
});

/** 是否有多张图片（需要轮播） */
const hasMultipleImages = computed(() => carouselImages.value.length > 1);

/** 规格组列表（从 product.specs 动态获取） */
const specGroups = computed(() => {
   if (!product.value?.specs) return [];
   return Object.values(product.value.specs);
});

/** 计算含规格加价的总价 */
const totalPrice = computed(() => {
   if (!product.value) return 0;
   return product.value.price;
});

/** 初始化默认选中每个规格组的第一个非售罄选项 */
const initDefaultSpecs = () => {
   if (!product.value?.specs) return;
   const defaults: Record<string, string> = {};
   for (const group of Object.values(product.value.specs)) {
      const availableOption = group.options.find(opt => !opt.isSoldOut);
      if (availableOption) {
         defaults[group.name] = availableOption.value;
      }
   }
   selectedSpecs.value = defaults;
};

/** 选择规格 */
const handleSelectSpec = (specKey: string, optionValue: string) => {
   selectedSpecs.value = { ...selectedSpecs.value, [specKey]: optionValue };
};

onLoad(async options => {
   const productId = options?.id;
   if (!productId) return;

   // 确保 store 数据已加载
   await homeStore.fetchData();

   const found = homeStore.getProductById(productId);
   if (found) {
      product.value = found;
      initDefaultSpecs();
   } else {
      uni.showToast({ title: '商品不存在', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
   }
});

const handleSwiperChange = (e: { detail: { current: number } }) => {
   currentSlide.value = e.detail.current;
};

const handleAddToCart = () => {
   if (!product.value) return;
   cartStore.addItem(product.value, { ...selectedSpecs.value });
   uni.navigateBack();
};
</script>

<template>
   <view class="page" v-if="product">
      <!-- 轮播图区域 -->
      <view class="carousel-section">
         <!-- 多张图片：使用轮播 -->
         <swiper
            v-if="hasMultipleImages"
            class="carousel"
            :indicator-dots="false"
            :autoplay="false"
            @change="handleSwiperChange"
         >
            <swiper-item v-for="(img, index) in carouselImages" :key="index">
               <image class="carousel-image" :src="img" mode="aspectFill" />
            </swiper-item>
         </swiper>

         <!-- 单张图片：直接显示 -->
         <image
            v-else
            class="carousel-image single-image"
            :src="carouselImages[0]"
            mode="aspectFill"
         />

         <!-- 指示器（仅多张图片时显示） -->
         <view v-if="hasMultipleImages" class="carousel-indicators">
            <view
               v-for="(_, index) in carouselImages"
               :key="index"
               class="indicator"
               :class="{ active: currentSlide === index }"
            />
         </view>
      </view>

      <!-- 主内容区域 -->
      <view class="main-content">
         <!-- 标题和评分 -->
         <view class="header-row">
            <text class="product-name">{{ product.name }}</text>
            <view class="rating">
               <text class="star">★</text>
               <text class="score">4.9</text>
            </view>
         </view>

         <!-- 价格 -->
         <view class="price-row">
            <view class="current-price">
               <text class="currency">¥</text>
               <text class="amount">{{ totalPrice }}</text>
            </view>
         </view>

         <!-- 描述 -->
         <text class="description">{{ product.description }}</text>

         <!-- 分隔线 -->
         <view class="divider" />

         <!-- 动态规格选项 -->
         <view v-if="specGroups.length > 0" class="options-section">
            <view v-for="group in specGroups" :key="group.name" class="option-group">
               <text class="option-title">{{ group.name }}</text>
               <view class="option-items">
                  <view
                     v-for="option in group.options"
                     :key="option.value"
                     class="option-btn"
                     :class="{
                        active: selectedSpecs[group.name] === option.value,
                        disabled: option.isSoldOut,
                     }"
                     @click="!option.isSoldOut && handleSelectSpec(group.name, option.value)"
                  >
                     <text class="option-text">
                        {{ option.value }}
                        <text v-if="option.isSoldOut" class="sold-out-tag"> (售罄)</text>
                     </text>
                  </view>
               </view>
            </view>
         </view>
      </view>

      <!-- 底部栏 -->
      <view class="bottom-bar">
         <view class="add-cart-btn" @click="handleAddToCart">
            <text class="btn-text">加入购物车</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.page {
   min-height: 100vh;
   background-color: #f8f7f6;
   position: relative;
   padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}

// 轮播图区域
.carousel-section {
   position: relative;
   width: 100%;
   aspect-ratio: 1;
}

.carousel {
   width: 100%;
   height: 100%;
}

.carousel-image {
   width: 100%;
   height: 100%;
}

.carousel-indicators {
   position: absolute;
   bottom: 32rpx;
   left: 0;
   right: 0;
   display: flex;
   justify-content: center;
   gap: 16rpx;
}

.indicator {
   width: 12rpx;
   height: 12rpx;
   border-radius: 50%;
   background-color: rgba(255, 255, 255, 0.5);

   &.active {
      width: 48rpx;
      border-radius: 6rpx;
      background-color: $brand-primary;
   }
}

// 主内容区域
.main-content {
   position: relative;
   margin-top: -48rpx;
   background-color: #f8f7f6;
   border-radius: 48rpx 48rpx 0 0;
   padding: 64rpx 32rpx 160rpx;
}

.header-row {
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: 16rpx;
}

.product-name {
   font-size: 48rpx;
   font-weight: 500;
   color: $text-primary;
   line-height: 64rpx;
}

.rating {
   display: flex;
   align-items: center;
   gap: 8rpx;
}

.star {
   font-size: 28rpx;
   color: $brand-primary;
}

.score {
   font-size: 28rpx;
   font-weight: 700;
   color: $brand-primary;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

// 价格
.price-row {
   display: flex;
   align-items: baseline;
   gap: 16rpx;
   margin-bottom: 32rpx;
}

.current-price {
   display: flex;
   align-items: baseline;
   color: $brand-primary;

   .currency {
      font-size: 36rpx;
      font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
   }

   .amount {
      font-size: 60rpx;
      font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
   }
}

// 描述
.description {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 45rpx;
   display: block;
   margin-bottom: 32rpx;
}

// 分隔线
.divider {
   height: 2rpx;
   background-color: rgba(238, 134, 43, 0.1);
   margin-bottom: 48rpx;
}

// 选项区域
.options-section {
   display: flex;
   flex-direction: column;
   gap: 48rpx;
   padding-bottom: 48rpx;
}

.option-group {
   display: flex;
   flex-direction: column;
   gap: 24rpx;
}

.option-title {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   line-height: 40rpx;
}

.option-items {
   display: flex;
   flex-wrap: wrap;
   gap: 16rpx;
}

.option-btn {
   padding: 20rpx 36rpx;
   border-radius: 32rpx;
   background-color: #f1f5f9;
   border: 2rpx solid transparent;

   &.active {
      background-color: rgba(238, 134, 43, 0.1);
      border-color: $brand-primary;

      .option-text {
         color: $brand-primary;
      }
   }

   &.disabled {
      opacity: 0.4;
   }
}

.option-text {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
}

.sold-out-tag {
   font-size: 24rpx;
   color: $text-muted;
}

// 底部栏
.bottom-bar {
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   padding: 32rpx;
   padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
   background-color: rgba(255, 255, 255, 0.8);
   backdrop-filter: blur(24rpx);
   z-index: 100;
}

.add-cart-btn {
   height: 96rpx;
   border-radius: 48rpx;
   background-color: $brand-primary;
   display: flex;
   align-items: center;
   justify-content: center;
   box-shadow:
      0 20rpx 30rpx -6rpx rgba(238, 134, 43, 0.3),
      0 8rpx 12rpx -8rpx rgba(238, 134, 43, 0.3);
}

.btn-text {
   font-size: 32rpx;
   font-weight: 500;
   color: #fff;
}
</style>
