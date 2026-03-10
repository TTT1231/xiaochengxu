<script setup lang="ts">
import type { Product } from '@/types';
import { commonIcons } from '@/data/imgPaths';
import { formatPriceDisplay } from '@/utils/format';

interface Props {
   product: Product;
   quantity?: number;
}

const props = defineProps<Props>();

interface Emits {
   (e: 'add'): void;
   (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const addIconSrc = commonIcons.add;

const handleAdd = (): void => {
   emit('click');
};

const handleClick = (): void => {
   emit('click');
};
</script>

<template>
   <view class="product-card" @click="handleClick">
      <view class="image-container">
         <image class="product-image" :src="product.image" mode="aspectFill" />
      </view>
      <view class="product-info">
         <view class="info-top">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-description">{{ product.description }}</text>
         </view>
         <view class="product-bottom">
            <text class="product-price">{{ formatPriceDisplay(product.price) }}</text>
            <view class="add-btn-wrapper">
               <view class="add-btn" @click.stop="handleAdd">
                  <image class="add-icon" :src="addIconSrc" mode="aspectFit" />
               </view>
               <view v-if="quantity && quantity > 0" class="quantity-badge">
                  <text class="badge-text">{{ quantity }}</text>
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.product-card {
   display: flex;
   gap: 24rpx;
   padding: 0;
}

.image-container {
   width: 192rpx;
   height: 192rpx;
   border-radius: 32rpx;
   overflow: hidden;
   background-color: $bg-input;
   flex-shrink: 0;
}

.product-image {
   width: 100%;
   height: 100%;
}

.product-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   padding: 2rpx 0 4rpx;
   min-width: 0;
}

.info-top {
   display: flex;
   flex-direction: column;
   gap: 8rpx;
}

.product-name {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   line-height: 35rpx;
}

.product-description {
   font-size: 20rpx;
   color: $text-muted;
   line-height: 30rpx;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.product-bottom {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.product-price {
   font-size: 32rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 48rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.add-btn {
   width: 56rpx;
   height: 56rpx;
   border-radius: 50%;
   background-color: $brand-primary;
   display: flex;
   align-items: center;
   justify-content: center;
}

.add-icon {
   width: 21rpx;
   height: 21rpx;
}

.add-btn-wrapper {
   position: relative;
}

.quantity-badge {
   position: absolute;
   top: -12rpx;
   right: -12rpx;
   min-width: 32rpx;
   height: 32rpx;
   padding: 0 8rpx;
   background-color: #ff3b30;
   border: 2rpx solid #ffffff;
   border-radius: 16rpx;
   box-sizing: border-box;
   display: flex;
   align-items: center;
   justify-content: center;
   box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.badge-text {
   font-size: 18rpx;
   font-weight: 700;
   color: #ffffff;
   line-height: 1;
   font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
