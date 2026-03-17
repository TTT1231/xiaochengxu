<script setup lang="ts">
import { ref } from 'vue';
import Header from '@/components/common/Header.vue';
import { useCartStore, useUserStore } from '@/stores';
import { formatPriceDisplay, getMainImage } from '@/utils/format';
import type { Products } from '@/types';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { createOrder } from '@/api/orderApi';

const { headerHeight } = useHeaderHeight();

const cartStore = useCartStore();
const userStore = useUserStore();
const {
   items: cartItems,
   totalAmount,
   originalAmount,
   totalDiscount,
   removeItem,
   addItem,
} = cartStore;
const submitting = ref(false);

const handleRemove = (productId: string) => {
   removeItem(productId);
};

const handleAdd = (product: Products) => {
   addItem(product);
};

const handleCheckout = async () => {
   if (cartItems.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' });
      return;
   }

   if (!userStore.isAuthenticated || !userStore.openid) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
   }

   submitting.value = true;
   try {
      const order = await createOrder({
         userId: userStore.openid,
         items: cartItems,
         totalAmount: originalAmount,
         discountAmount: totalDiscount,
      });

      cartStore.clearCart();
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
                  <view class="control-btn minus" @click="handleRemove(item.product._id)">
                     <text class="minus-text">−</text>
                  </view>
                  <text class="quantity-text">{{ item.quantity }}</text>
                  <view class="control-btn plus" @click="handleAdd(item.product)">
                     <text class="plus-text">+</text>
                  </view>
               </view>
            </view>
         </view>
      </view>

      <view v-if="cartItems.length > 0" class="bottom-bar">
         <view class="total-info">
            <text class="total-label">合计</text>
            <text class="total-amount">{{ formatPriceDisplay(totalAmount) }}</text>
         </view>
         <view
            class="checkout-btn"
            :class="{ disabled: submitting }"
            @click="!submitting && handleCheckout()"
         >
            <text class="checkout-text">{{ submitting ? '下单中...' : '去结算' }}</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.cart-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-bottom: 160rpx;
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
   padding: 24rpx 32rpx;
   display: flex;
   align-items: center;
   justify-content: space-between;
   box-shadow: 0px -4rpx 16rpx rgba(0, 0, 0, 0.05);
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
   padding: 24rpx 64rpx;
   border-radius: $radius-full;

   &.disabled {
      opacity: 0.6;
   }
}

.checkout-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $uni-text-color-inverse;
}
</style>
