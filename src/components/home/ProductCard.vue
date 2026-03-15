<script setup lang="ts">
import type { Products } from '@/types';
import { formatPriceDisplay, getMainImage } from '@/utils/format';

interface Props {
   product: Products;
   quantity?: number;
}

defineProps<Props>();

interface Emits {
   (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const handleClick = (): void => {
   emit('click');
};
</script>

<template>
   <view class="card-container" @click="handleClick">
      <image class="card-cover" :src="getMainImage(product.images)" mode="aspectFill" />

      <view class="card-content">
         <view class="text-group">
            <view class="title">{{ product.name }}</view>
            <view class="desc" v-if="product.description">{{ product.description }}</view>
         </view>

         <view class="bottom-group">
            <view class="price">{{ formatPriceDisplay(product.price) }}</view>
            <view class="action-btn">
               <!-- 移除文字加号，完全使用 CSS 伪元素绘制完美居中的加号 -->
               <view v-if="quantity && quantity > 0" class="badge">
                  <text class="badge-num">{{ quantity }}</text>
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.card-container {
   display: flex;
   width: 100%;
   padding: 0;
   box-sizing: border-box;
}

.card-cover {
   width: 192rpx;
   height: 192rpx;
   border-radius: 32rpx;
   background-color: #f8fafc;
   flex-shrink: 0;
}

.card-content {
   flex: 1;
   min-width: 0;
   max-width: calc(100% - 248rpx); // 192(图片) + 24(左距) + 32(右距)
   margin-left: 24rpx;
   margin-right: 32rpx;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   padding: 10rpx 0;
   box-sizing: border-box;
}

.text-group {
   width: 100%;
   min-width: 0;
   display: flex;
   flex-direction: column;
}

.title {
   font-size: 28rpx;
   font-weight: bold;
   color: $text-primary;
   line-height: 40rpx;
   display: block;
   width: 100%;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.desc {
   font-size: 22rpx;
   color: $text-tertiary;
   line-height: 32rpx;
   margin-top: 6rpx;
   width: 100%;
   // 小程序多行截断
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 2;
   overflow: hidden;
   word-break: break-all;
}

.bottom-group {
   display: flex;
   align-items: center;
   justify-content: space-between;
   width: 100%;
   box-sizing: border-box;
}

.price {
   font-size: 32rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 1;
   font-family: 'Plus Jakarta Sans', sans-serif;
   flex: 1;
   min-width: 0;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   margin-right: 20rpx;
}

.action-btn {
   width: 48rpx;
   height: 48rpx;
   background-color: $brand-primary;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
   flex-shrink: 0;
}

.action-btn::before,
.action-btn::after {
   content: '';
   position: absolute;
   background-color: $uni-text-color-inverse;
   border-radius: 4rpx;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
}

.action-btn::before {
   width: 22rpx;
   height: 4rpx;
}

.action-btn::after {
   width: 4rpx;
   height: 22rpx;
}

.badge {
   position: absolute;
   top: -12rpx;
   right: -12rpx;
   background-color: $badge-count;
   border: 2rpx solid $uni-text-color-inverse;
   border-radius: 16rpx;
   min-width: 32rpx;
   height: 32rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0 8rpx;
   box-sizing: border-box;
}

.badge-num {
   font-size: 18rpx;
   color: $uni-text-color-inverse;
   font-weight: bold;
   line-height: 1;
   font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
