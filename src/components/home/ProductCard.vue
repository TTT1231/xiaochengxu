<template>
   <view class="product-card">
      <view class="image-container">
         <image class="product-image" :src="product.image" mode="aspectFill" />
      </view>
      <view class="product-info">
         <view class="info-top">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-description">{{ product.description }}</text>
         </view>
         <view class="product-bottom">
            <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
            <view class="quantity-control">
               <view
                  v-if="quantity > 0"
                  class="control-btn minus"
                  @click.stop="handleRemove"
               >
                  <text class="minus-text">−</text>
               </view>
               <text v-if="quantity > 0" class="quantity-text">{{
                  quantity
               }}</text>
               <view class="control-btn plus" @click.stop="handleAdd">
                  <image class="add-icon" :src="addIconSrc" mode="aspectFit" />
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import type { Product } from '@/types';
import { commonIcons } from '@/data/imgPaths';

interface Props {
   product: Product;
   quantity?: number;
}

withDefaults(defineProps<Props>(), {
   quantity: 0,
});

interface Emits {
   (e: 'add'): void;
   (e: 'remove'): void;
}

const emit = defineEmits<Emits>();

const addIconSrc = commonIcons.add;

const handleAdd = (): void => {
   emit('add');
};

const handleRemove = (): void => {
   emit('remove');
};
</script>

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
   padding: 4rpx 0;
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

.quantity-control {
   display: flex;
   align-items: center;
   gap: 8rpx;
}

.control-btn {
   width: 56rpx;
   height: 56rpx;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;

   &.minus {
      background-color: $bg-page;
      border: 2rpx solid $border-default;
   }

   &.plus {
      background-color: $brand-primary;
   }
}

.minus-text {
   font-size: 28rpx;
   font-weight: 300;
   color: $text-primary;
   line-height: 1;
}

.add-icon {
   width: 21rpx;
   height: 21rpx;
}

.quantity-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   min-width: 32rpx;
   text-align: center;
}
</style>
