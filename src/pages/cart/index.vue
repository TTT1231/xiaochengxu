<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/common/Header.vue';
import { useCartStore, useUserStore } from '@/stores';
import { formatPriceDisplay, getMainImage } from '@/utils/format';
import type { Products } from '@/types';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { createOrder } from '@/api/orderApi';

const { headerHeight } = useHeaderHeight();

const cartStore = useCartStore();
const userStore = useUserStore();
const { items: cartItems, removeItem, addItem } = cartStore;
const submitting = ref(false);
const useWallet = ref(false);

const wallet = computed(() => userStore.wallet);
const availableWalletDeduct = computed(() => {
   if (!wallet.value) return 0;
   return Math.min(wallet.value.balance, cartStore.totalAmount);
});
const walletDeductAmount = computed(() => (useWallet.value ? availableWalletDeduct.value : 0));
const payableAmount = computed(() => Math.max(cartStore.totalAmount - walletDeductAmount.value, 0));

const handleRemove = (productId: string, selectedSpecs: Record<string, string>) => {
   removeItem(productId, selectedSpecs);
};

const handleAdd = (product: Products, selectedSpecs: Record<string, string>) => {
   addItem(product, selectedSpecs);
};

function onCheckoutClick(): void {
   if (!submitting.value) {
      handleCheckout();
   }
}

const handleCheckout = async () => {
   if (cartItems.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' });
      return;
   }

   if (!userStore.isAuthenticated) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
   }

   submitting.value = true;
   try {
      const order = await createOrder({
         items: cartItems,
         totalAmount: cartStore.originalAmount,
         discountAmount: cartStore.totalDiscount,
         walletDeduct: walletDeductAmount.value,
      });

      cartStore.clearCart();
      useWallet.value = false;
      userStore.fetchProfile();

      uni.redirectTo({
         url: `/pages/order/detail?id=${order.order_id}`,
      });
   } catch (err) {
      uni.showToast({
         title: err instanceof Error ? err.message : '下单失败',
         icon: 'none',
      });
   } finally {
      submitting.value = false;
   }
};
</script>

<template>
   <view class="cart-page">
      <Header title="购物车" :show-back="true" />

      <view class="page-content" :style="{ paddingTop: headerHeight + 'px' }">
         <view v-if="cartItems.length === 0" class="empty-state">
            <image class="empty-icon" src="/static/images/empty-order.png" mode="aspectFit" />
            <text class="empty-text">购物车是空的</text>
            <text class="empty-hint">去添加一些美味的商品吧</text>
         </view>

         <view v-else class="cart-list">
            <view v-for="item in cartItems" :key="item.product._id" class="cart-item">
               <image
                  class="item-image"
                  :src="getMainImage(item.product.images)"
                  mode="aspectFill"
               />
               <view class="item-info">
                  <text class="item-name">{{ item.product.name }}</text>
                  <view v-if="Object.keys(item.selectedSpecs).length > 0" class="specs-tags">
                     <text v-for="(value, key) in item.selectedSpecs" :key="key" class="spec-tag">
                        {{ value }}
                     </text>
                  </view>
                  <view class="item-price-group">
                     <text class="item-price">{{
                        formatPriceDisplay(item.product.price - item.product.discount)
                     }}</text>
                     <text v-if="item.product.discount > 0" class="item-original-price">{{
                        formatPriceDisplay(item.product.price)
                     }}</text>
                  </view>
               </view>
               <view class="quantity-control">
                  <view
                     class="control-btn minus"
                     @click="handleRemove(item.product._id, item.selectedSpecs)"
                  >
                     <text class="minus-text">−</text>
                  </view>
                  <text class="quantity-text">{{ item.quantity }}</text>
                  <view
                     class="control-btn plus"
                     @click="handleAdd(item.product, item.selectedSpecs)"
                  >
                     <text class="plus-text">+</text>
                  </view>
               </view>
            </view>
         </view>
      </view>

      <view v-if="cartItems.length > 0" class="bottom-bar">
         <view
            v-if="wallet && wallet.balance > 0"
            class="wallet-deduct"
            @click="useWallet = !useWallet"
         >
            <view class="deduct-left">
               <view class="checkbox" :class="{ checked: useWallet }">
                  <text v-if="useWallet" class="check-mark">✓</text>
               </view>
               <text class="deduct-text">使用余额</text>
            </view>
            <text class="deduct-amount">抵扣 {{ formatPriceDisplay(availableWalletDeduct) }}</text>
         </view>

         <view class="checkout-row">
            <view class="total-info">
               <text class="total-label">{{ useWallet ? '实付' : '合计' }}</text>
               <text class="total-amount">{{ formatPriceDisplay(payableAmount) }}</text>
            </view>

            <view class="checkout-btn" :class="{ disabled: submitting }" @click="onCheckoutClick">
               <text class="checkout-text">{{ submitting ? '下单中...' : '去结算' }}</text>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.cart-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
}

.page-content {
   padding: 24rpx;
}

.empty-state {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding-top: 200rpx;
}

.empty-icon {
   width: 240rpx;
   height: 240rpx;
   opacity: 0.4;
   margin-bottom: 32rpx;
}

.empty-text {
   font-size: 32rpx;
   color: $text-primary;
   font-weight: 500;
   margin-bottom: 16rpx;
}

.empty-hint {
   font-size: 28rpx;
   color: $text-muted;
}

.cart-list {
   display: flex;
   flex-direction: column;
   gap: 24rpx;
}

.cart-item {
   display: flex;
   align-items: center;
   gap: 24rpx;
   background-color: $bg-card;
   padding: 24rpx;
   border-radius: $radius-lg;
}

.item-image {
   width: 160rpx;
   height: 160rpx;
   border-radius: $radius-md;
   background-color: $bg-input;
}

.item-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 8rpx;
   min-width: 0;
}

.item-name {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.specs-tags {
   display: flex;
   flex-wrap: wrap;
   gap: 8rpx;
}

.spec-tag {
   font-size: 22rpx;
   color: $brand-primary;
   background-color: rgba(238, 134, 43, 0.1);
   padding: 4rpx 16rpx;
   border-radius: $radius-full;
   line-height: 32rpx;
}

.item-price-group {
   display: flex;
   align-items: baseline;
   gap: 10rpx;
}

.item-price {
   font-size: 32rpx;
   font-weight: 700;
   color: $brand-primary;
}

.item-original-price {
   font-size: 22rpx;
   color: $text-muted;
   text-decoration: line-through;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.quantity-control {
   display: flex;
   align-items: center;
   gap: 16rpx;
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

.minus-text,
.plus-text {
   font-size: 32rpx;
   color: $text-primary;
   line-height: 1;
}

.plus-text {
   color: $uni-text-color-inverse;
}

.quantity-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-primary;
   min-width: 48rpx;
   text-align: center;
}

.bottom-bar {
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   background-color: $bg-card;
   display: flex;
   flex-direction: column;
   gap: 18rpx;
   padding: 18rpx 32rpx calc(22rpx + env(safe-area-inset-bottom));
   box-shadow: 0px -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.checkout-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 24rpx;
}

.total-info {
   display: flex;
   flex-direction: column;
   gap: 4rpx;
}

.total-label {
   font-size: 24rpx;
   color: $text-muted;
}

.total-amount {
   font-size: 40rpx;
   font-weight: 700;
   color: $brand-primary;
}

.checkout-btn {
   background-color: $brand-primary;
   min-width: 192rpx;
   height: 80rpx;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;

   &.disabled {
      opacity: 0.6;
   }
}

.checkout-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $uni-text-color-inverse;
}

.wallet-deduct {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 20rpx;
   min-height: 56rpx;
   padding-bottom: 14rpx;
   border-bottom: 1rpx solid $border-default;
}

.deduct-left {
   display: flex;
   align-items: center;
   gap: 12rpx;
   min-width: 0;
}

.checkbox {
   width: 36rpx;
   height: 36rpx;
   border-radius: 50%;
   border: 2rpx solid $border-default;
   display: flex;
   align-items: center;
   justify-content: center;

   &.checked {
      background-color: $brand-primary;
      border-color: $brand-primary;
   }
}

.check-mark {
   font-size: 20rpx;
   color: $uni-text-color-inverse;
   line-height: 1;
}

.deduct-text {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}

.deduct-amount {
   flex-shrink: 0;
   font-size: 24rpx;
   color: $brand-primary;
   line-height: 34rpx;
}
</style>
