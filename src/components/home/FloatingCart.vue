<script setup lang="ts">
import { commonIcons } from '@/data/imgPaths';
import { formatPriceDisplay } from '@/utils/format';

interface Props {
   count: number;
   amount: number;
   discount?: number;
}

withDefaults(defineProps<Props>(), {
   discount: 0,
});

interface Emits {
   (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const cartIconSrc = commonIcons.cartWhite;

const handleClick = (): void => {
   emit('click');
};
</script>

<template>
   <view class="floating-cart" @click="handleClick">
      <view class="cart-bg"></view>
      <view class="cart-content">
         <view class="cart-left">
            <view class="cart-icon-wrapper">
               <image class="cart-icon" :src="cartIconSrc" mode="aspectFit" />
               <view v-if="count > 0" class="cart-badge">
                  <text class="badge-text">{{ count }}</text>
               </view>
            </view>
            <view class="price-info">
               <text class="cart-amount">{{ formatPriceDisplay(amount) }}</text>
               <text class="discount-text">已优惠 {{ formatPriceDisplay(discount) }}</text>
            </view>
         </view>
         <view class="checkout-btn">
            <text class="checkout-text">去结算</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.floating-cart {
   position: fixed;
   bottom: 200rpx;
   left: 32rpx;
   right: 32rpx;
   height: 112rpx;
   border-radius: $radius-full;
   z-index: 100;
}

.cart-bg {
   position: absolute;
   inset: 0;
   background-color: rgba($text-primary, 0.9);
   backdrop-filter: blur(12rpx);
   border-radius: $radius-full;
   box-shadow:
      0px 40rpx 50rpx -10rpx rgba(0, 0, 0, 0.1),
      0px 16rpx 20rpx -12rpx rgba(0, 0, 0, 0.1);
}

.cart-content {
   position: relative;
   display: flex;
   align-items: center;
   justify-content: space-between;
   height: 100%;
   padding: 0 16rpx;
}

.cart-left {
   display: flex;
   align-items: center;
   gap: 24rpx;
}

.cart-icon-wrapper {
   position: relative;
   width: 96rpx; /* size-[48px] in Figma */
   height: 96rpx;
   background-color: $brand-primary;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   border: 8rpx solid $bg-page; /* border-4 in Figma */
   margin-top: -32rpx; /* Extends 32rpx above the bar */
   flex-shrink: 0;
}

.cart-icon {
   width: 44rpx;
   height: 38rpx;
}

.cart-badge {
   position: absolute;
   top: -8rpx;
   right: -8rpx;
   min-width: 40rpx;
   height: 40rpx;
   background-color: $badge-error;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   border: 4rpx solid $text-primary;
}

.badge-text {
   font-size: 20rpx;
   font-weight: 700;
   color: $uni-text-color-inverse;
   line-height: 30rpx;
}

.price-info {
   display: flex;
   flex-direction: column;
   gap: 0;
}

.cart-amount {
   font-size: 28rpx;
   font-weight: 700;
   color: $uni-text-color-inverse;
   line-height: 40rpx;
}

.discount-text {
   font-size: 20rpx;
   color: $text-muted;
   line-height: 30rpx;
}

.checkout-btn {
   background-color: $brand-primary;
   padding: 20rpx 48rpx;
   border-radius: $radius-full;
}

.checkout-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $uni-text-color-inverse;
   line-height: 40rpx;
   text-align: center;
}
</style>
