<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { Product } from '@/types';
import { products } from '@/mock';
import { useCart } from '@/composables/useCart';
import { formatPriceDisplay } from '@/utils/format';

const { addItem } = useCart();

const product = ref<Product | null>(null);
const currentSlide = ref(0);
const selectedSweetness = ref('标准甜');
const selectedPackaging = ref('环保纸袋');

const sweetnessOptions = ['标准甜', '半糖', '无额外糖'];
const packagingOptions = [
   { label: '环保纸袋 (免费)', value: '环保纸袋', extraPrice: 0 },
   { label: '礼品精装 (+¥5)', value: '礼品精装', extraPrice: 5 },
];

const carouselImages = computed(() => {
   if (!product.value) return [];
   return [
      product.value.image,
      product.value.image,
      product.value.image,
      product.value.image,
   ];
});

const totalPrice = computed(() => {
   if (!product.value) return 0;
   const packaging = packagingOptions.find(
      p => p.value === selectedPackaging.value,
   );
   const extraPrice = packaging?.extraPrice || 0;
   return product.value.price + extraPrice;
});

onLoad(options => {
   const productId = options?.id;
   if (productId) {
      const found = products.find(p => p.id === productId);
      if (found) {
         product.value = found;
      } else {
         uni.showToast({ title: '商品不存在', icon: 'none' });
         setTimeout(() => uni.navigateBack(), 1500);
      }
   }
});

const handleSwiperChange = (e: { detail: { current: number } }) => {
   currentSlide.value = e.detail.current;
};

const handleAddToCart = () => {
   if (!product.value) return;

   const itemWithOptions = {
      ...product.value,
      name: `${product.value.name} (${selectedSweetness.value}, ${selectedPackaging.value})`,
      price: totalPrice.value,
   };

   addItem(itemWithOptions);
   uni.navigateBack();
};
</script>

<template>
   <view class="page" v-if="product">
      <!-- 轮播图区域 -->
      <view class="carousel-section">
         <swiper
            class="carousel"
            :indicator-dots="false"
            :autoplay="false"
            @change="handleSwiperChange"
         >
            <swiper-item v-for="(img, index) in carouselImages" :key="index">
               <image class="carousel-image" :src="img" mode="aspectFill" />
            </swiper-item>
         </swiper>

         <!-- 指示器 -->
         <view class="carousel-indicators">
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
               <text class="amount">{{ product.price }}</text>
            </view>
            <text class="original-price">¥35.00</text>
         </view>

         <!-- 描述 -->
         <text class="description">
            层层浓郁的巧克力，进口丝滑口感，纯手工精心制作，每一口都是极致享受。选用70%浓度黑巧克力，口感微苦回甘。
         </text>

         <!-- 分隔线 -->
         <view class="divider" />

         <!-- 定制选项 -->
         <view class="options-section">
            <!-- 甜度选择 -->
            <view class="option-group">
               <text class="option-title">甜度选择</text>
               <view class="option-items">
                  <view
                     v-for="option in sweetnessOptions"
                     :key="option"
                     class="option-btn"
                     :class="{ active: selectedSweetness === option }"
                     @click="selectedSweetness = option"
                  >
                     <text class="option-text">{{ option }}</text>
                  </view>
               </view>
            </view>

            <!-- 包装选择 -->
            <view class="option-group">
               <text class="option-title">包装选择</text>
               <view class="option-items">
                  <view
                     v-for="option in packagingOptions"
                     :key="option.value"
                     class="option-btn"
                     :class="{ active: selectedPackaging === option.value }"
                     @click="selectedPackaging = option.value"
                  >
                     <text class="option-text">{{ option.label }}</text>
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

.original-price {
   font-size: 28rpx;
   color: $text-muted;
   text-decoration: line-through;
   font-family: 'Plus Jakarta Sans', sans-serif;
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
}

.option-text {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
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
