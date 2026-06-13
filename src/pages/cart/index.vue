<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import { getDeliveryConfig, calcDeliveryFee } from '@/api/deliveryApi';
import type { DeliveryConfigResult } from '@/api/deliveryApi';
import { useCartStore, useUserStore } from '@/stores';
import { formatPriceDisplay, getProductImage } from '@/utils/format';
import { getItemDiscount } from '@/utils/discount';
import type { Products } from '@/types';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { createOrder } from '@/api/orderApi';
import { getBusinessHours } from '@/api/businessHoursApi';
import {
   hasBirthdayCake,
   isCakeProduct,
   getUnavailableReason,
   earliestPickupMinutes,
   validateOrderTime,
   formatMinutesToTime,
} from '@/utils/orderTime';

const { headerHeight } = useHeaderHeight();

const cartStore = useCartStore();
const userStore = useUserStore();
const { items: cartItems, removeItem, addItem } = cartStore;
const submitting = ref(false);
const useWallet = ref(false);
const deliveryType = ref<'pickup' | 'delivery'>('pickup');
const remark = ref('');
const deliveryConfig = ref<DeliveryConfigResult>({ free_threshold: 30, delivery_fee: 8 });
const businessHours = ref({ open_time: '09:00', close_time: '22:00' });
const expectedTime = ref('');
const nowSnapshot = ref(new Date());

const wallet = computed(() => userStore.wallet);
const availableWalletDeduct = computed(() => {
   if (!wallet.value) return 0;
   return Math.min(wallet.value.balance, cartStore.totalAmount);
});
const walletDeductAmount = computed(() => (useWallet.value ? availableWalletDeduct.value : 0));
const payableAmount = computed(() => Math.max(cartStore.totalAmount - walletDeductAmount.value, 0));

const deliveryFee = computed(() =>
   calcDeliveryFee(cartStore.totalAmount, deliveryType.value, deliveryConfig.value),
);

const isDeliveryInfoComplete = computed(() => {
   if (deliveryType.value === 'pickup') return true;
   return !!userStore.user?.phone && !!userStore.user?.address;
});

const hasCakeInCart = computed(() => hasBirthdayCake(cartItems));

const unavailableReason = computed(() =>
   getUnavailableReason({
      openTime: businessHours.value.open_time,
      closeTime: businessHours.value.close_time,
      hasCake: hasCakeInCart.value,
      now: nowSnapshot.value,
   }),
);

const pickerStart = computed(() =>
   formatMinutesToTime(
      earliestPickupMinutes({
         openTime: businessHours.value.open_time,
         closeTime: businessHours.value.close_time,
         hasCake: hasCakeInCart.value,
         now: nowSnapshot.value,
      }),
   ),
);

const pickerEnd = computed(() => businessHours.value.close_time);

const canCheckout = computed(
   () =>
      cartItems.length > 0 &&
      isDeliveryInfoComplete.value &&
      !submitting.value &&
      !unavailableReason.value &&
      !!expectedTime.value,
);

const finalPayableAmount = computed(() =>
   Math.max(cartStore.totalAmount - walletDeductAmount.value + deliveryFee.value, 0),
);

onShow(async () => {
   nowSnapshot.value = new Date();
   const [config, hours] = await Promise.all([getDeliveryConfig(), getBusinessHours()]);
   deliveryConfig.value = config;
   businessHours.value = hours;
});

function goToProfile(): void {
   uni.navigateTo({ url: '/pages/profile/edit' });
}

const handleRemove = (productId: string, selectedSpecs: Record<string, string>) => {
   removeItem(productId, selectedSpecs);
};

const handleAdd = (product: Products, selectedSpecs: Record<string, string>) => {
   addItem(product, selectedSpecs);
};

function goToMenu(): void {
   uni.switchTab({ url: '/pages/index/index' });
}

function onCheckoutClick(): void {
   if (!submitting.value) {
      handleCheckout();
   }
}

function onTimeChange(event: { detail: { value: string } }): void {
   expectedTime.value = event.detail.value;
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

   if (!isDeliveryInfoComplete.value) {
      uni.showToast({ title: '配送信息不完整', icon: 'none' });
      return;
   }

   if (unavailableReason.value) {
      uni.showToast({
         title: unavailableReason.value === 'closed' ? '今日营业已结束' : '生日蛋糕今日已无法预订',
         icon: 'none',
      });
      return;
   }

   // submit 时用即时时间复算，防止页面停留过久导致所选时间过期
   const timeCheck = validateOrderTime({
      expectedTime: expectedTime.value,
      openTime: businessHours.value.open_time,
      closeTime: businessHours.value.close_time,
      hasCake: hasCakeInCart.value,
      now: new Date(),
   });
   if (!timeCheck.valid) {
      uni.showToast({ title: timeCheck.message ?? '预约时间无效', icon: 'none' });
      return;
   }

   submitting.value = true;
   try {
      const order = await createOrder({
         items: cartItems,
         totalAmount: cartStore.originalAmount,
         discountAmount: cartStore.totalDiscount,
         walletDeduct: walletDeductAmount.value,
         deliveryType: deliveryType.value,
         deliveryFee: deliveryFee.value,
         expectedTime: expectedTime.value,
         remark: remark.value || undefined,
         deliveryAddress:
            deliveryType.value === 'delivery' ? (userStore.user?.address ?? undefined) : undefined,
         deliveryPhone:
            deliveryType.value === 'delivery' ? (userStore.user?.phone ?? undefined) : undefined,
      });

      cartStore.clearCart();
      useWallet.value = false;
      remark.value = '';
      expectedTime.value = '';
      deliveryType.value = 'pickup';
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
            <view class="empty-cart-icon">
               <view class="cart-body" />
               <view class="cart-handle" />
               <view class="cart-wheel cart-wheel-left" />
               <view class="cart-wheel cart-wheel-right" />
            </view>
            <text class="empty-title">购物车是空的</text>
            <text class="empty-desc">快去挑选喜欢的甜品吧</text>
            <view class="empty-action" @click="goToMenu">
               <text class="empty-action-text">去逛逛</text>
            </view>
         </view>

         <view v-else class="cart-list">
            <view v-if="hasCakeInCart" class="cake-banner">
               <text class="cake-banner-icon">🎂</text>
               <text class="cake-banner-text">本单含生日蛋糕，需提前 3 小时预订</text>
            </view>
            <view v-for="item in cartItems" :key="item.product._id" class="cart-item">
               <image
                  class="item-image"
                  :src="getProductImage(item.product.image)"
                  mode="aspectFill"
               />
               <view class="item-info">
                  <text class="item-name">{{ item.product.name }}</text>
                  <view v-if="isCakeProduct(item.product)" class="cake-item-tag">
                     <text class="cake-item-tag-text">🎂 需提前 3 小时预订</text>
                  </view>
                  <view v-if="Object.keys(item.selectedSpecs).length > 0" class="specs-tags">
                     <text v-for="(value, key) in item.selectedSpecs" :key="key" class="spec-tag">
                        {{ value }}
                     </text>
                  </view>
                  <view class="item-price-group">
                     <text class="item-price">{{
                        formatPriceDisplay(
                           item.product.price -
                              getItemDiscount(
                                 item.product.price,
                                 item.product.categoried_id,
                                 userStore.isVip,
                              ),
                        )
                     }}</text>
                     <text
                        v-if="
                           getItemDiscount(
                              item.product.price,
                              item.product.categoried_id,
                              userStore.isVip,
                           ) > 0
                        "
                        class="item-original-price"
                        >{{ formatPriceDisplay(item.product.price) }}</text
                     >
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

            <view class="delivery-section">
               <view class="delivery-header">
                  <text class="delivery-title">取餐方式</text>
               </view>
               <view class="delivery-toggle">
                  <view
                     class="toggle-option"
                     :class="{ active: deliveryType === 'pickup' }"
                     @click="deliveryType = 'pickup'"
                  >
                     <text class="toggle-mark">店</text>
                     <text class="toggle-label">到店自提</text>
                  </view>
                  <view
                     class="toggle-option"
                     :class="{ active: deliveryType === 'delivery' }"
                     @click="deliveryType = 'delivery'"
                  >
                     <text class="toggle-mark">送</text>
                     <text class="toggle-label">商家配送</text>
                  </view>
               </view>

               <view v-if="deliveryType === 'delivery'" class="delivery-panel">
                  <view v-if="!isDeliveryInfoComplete" class="delivery-hint">
                     <view class="hint-text">
                        <text class="hint-title">配送信息缺失</text>
                        <text class="hint-desc">请先绑定手机号和地址</text>
                     </view>
                     <view class="hint-action" @click="goToProfile">去绑定</view>
                  </view>
                  <view v-else class="delivery-info">
                     <view class="info-row">
                        <text class="info-label">地址</text>
                        <text class="info-text">{{ userStore.user?.address }}</text>
                     </view>
                     <view class="info-row">
                        <text class="info-label">手机</text>
                        <text class="info-text">{{ userStore.user?.phone }}</text>
                     </view>
                  </view>
               </view>

               <view v-if="deliveryType === 'delivery'" class="delivery-fee-row">
                  <view class="fee-left">
                     <text class="fee-label">配送费</text>
                     <text class="fee-threshold"
                        >(满{{ deliveryConfig.free_threshold }}免{{
                           deliveryConfig.delivery_fee
                        }})</text
                     >
                  </view>
                  <text class="fee-value" :class="{ free: deliveryFee === 0 }">
                     {{ deliveryFee === 0 ? '免配送费' : formatPriceDisplay(deliveryFee) }}
                  </text>
               </view>

               <!-- 预约时间 -->
               <view class="reservation-section">
                  <text class="reservation-title">预约时间</text>
                  <view
                     v-if="unavailableReason === 'closed'"
                     class="reservation-unavailable closed"
                  >
                     <text class="reservation-unavailable-main">🌙 今日营业已结束</text>
                     <text class="reservation-unavailable-sub"
                        >营业时间 {{ businessHours.open_time }} -
                        {{ businessHours.close_time }}，请明日再来</text
                     >
                  </view>
                  <view
                     v-else-if="unavailableReason === 'cake'"
                     class="reservation-unavailable cake"
                  >
                     <text class="reservation-unavailable-main"
                        >🎂 今日营业时间内已无法预订生日蛋糕</text
                     >
                     <text class="reservation-unavailable-sub">需提前 3 小时，但距关店已不足</text>
                  </view>
                  <view
                     v-else
                     class="reservation-picker-row"
                     :class="{ 'has-value': expectedTime }"
                  >
                     <picker
                        mode="time"
                        :value="expectedTime || pickerStart"
                        :start="pickerStart"
                        :end="pickerEnd"
                        @change="onTimeChange"
                     >
                        <view class="reservation-picker-inner">
                           <text class="reservation-icon">🕐</text>
                           <text class="reservation-value" :class="{ set: expectedTime }">
                              {{
                                 expectedTime ||
                                 '请选择期望' +
                                    (deliveryType === 'pickup' ? '到店' : '到货') +
                                    '时间'
                              }}
                           </text>
                           <text class="reservation-arrow">❯</text>
                        </view>
                     </picker>
                  </view>
                  <view v-if="!unavailableReason" class="reservation-hint">
                     营业时间 {{ businessHours.open_time }} - {{ businessHours.close_time }} ·
                     仅限当天
                  </view>
                  <view v-if="hasCakeInCart && !unavailableReason" class="reservation-cake-hint">
                     🎂 含生日蛋糕，需提前 3 小时预订，最早 {{ pickerStart }}
                  </view>
               </view>

               <view class="remark-section">
                  <input
                     class="remark-input"
                     v-model="remark"
                     placeholder="订单备注（选填）"
                     maxlength="200"
                  />
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
               <text class="total-amount">{{ formatPriceDisplay(finalPayableAmount) }}</text>
            </view>

            <view class="checkout-btn" :class="{ disabled: !canCheckout }" @click="onCheckoutClick">
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
   padding-bottom: calc(210rpx + env(safe-area-inset-bottom));
}

.page-content {
   padding: 24rpx;
}

.empty-state {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding-top: 160rpx;
}

/* 纯 CSS 购物车图标 */
.empty-cart-icon {
   position: relative;
   width: 180rpx;
   height: 160rpx;
   margin-bottom: 48rpx;
}

.cart-body {
   position: absolute;
   bottom: 40rpx;
   left: 10rpx;
   width: 160rpx;
   height: 80rpx;
   background: $brand-primary-light;
   border: 6rpx solid $brand-primary;
   border-radius: 12rpx 80rpx 16rpx 16rpx;
}

.cart-handle {
   position: absolute;
   top: 12rpx;
   right: 10rpx;
   width: 72rpx;
   height: 72rpx;
   border: 6rpx solid $brand-primary;
   border-radius: 50% 50% 0 0;
   border-bottom: none;
   background: transparent;
}

.cart-wheel {
   position: absolute;
   bottom: 8rpx;
   width: 24rpx;
   height: 24rpx;
   border-radius: 50%;
   background: $brand-primary;

   &.cart-wheel-left {
      left: 30rpx;
   }

   &.cart-wheel-right {
      right: 30rpx;
   }
}

.empty-title {
   font-size: 34rpx;
   color: $text-primary;
   font-weight: 600;
   margin-bottom: 12rpx;
}

.empty-desc {
   font-size: 26rpx;
   color: $text-muted;
   margin-bottom: 48rpx;
}

.empty-action {
   background-color: $brand-primary;
   padding: 20rpx 80rpx;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;
}

.empty-action-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $uni-text-color-inverse;
}

.cart-list {
   display: flex;
   flex-direction: column;
   gap: 24rpx;
}

.cake-banner {
   display: flex;
   align-items: center;
   gap: 12rpx;
   background: #fef6ec;
   border: 1rpx solid rgba(245, 158, 11, 0.35);
   border-radius: $radius-lg;
   padding: 20rpx 24rpx;
}

.cake-banner-icon {
   font-size: 32rpx;
   line-height: 1;
}

.cake-banner-text {
   flex: 1;
   font-size: 25rpx;
   font-weight: 600;
   color: #92610a;
   line-height: 36rpx;
}

.cake-item-tag {
   align-self: flex-start;
   background: #fef6ec;
   border: 1rpx solid rgba(245, 158, 11, 0.3);
   border-radius: $radius-full;
   padding: 4rpx 16rpx;
   margin-top: 6rpx;
}

.cake-item-tag-text {
   font-size: 20rpx;
   font-weight: 600;
   color: #92610a;
   line-height: 30rpx;
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
   gap: 14rpx;
   padding: 16rpx 32rpx calc(22rpx + env(safe-area-inset-bottom));
   border-radius: 24rpx 24rpx 0 0;
   box-shadow: 0 -8rpx 28rpx rgba(43, 28, 15, 0.08);
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
   padding: 0 4rpx 14rpx;
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

.delivery-section {
   display: flex;
   flex-direction: column;
   gap: 16rpx;
   background: $bg-card;
   border-radius: $radius-lg;
   padding: 24rpx;
}

.delivery-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 4rpx;
}

.delivery-title {
   font-size: 24rpx;
   font-weight: 600;
   color: $text-secondary;
   line-height: 34rpx;
}

.delivery-toggle {
   display: flex;
   background: #f8f5f2;
   border: 1rpx solid rgba(238, 134, 43, 0.12);
   border-radius: 16rpx;
   padding: 6rpx;
   gap: 6rpx;
}

.toggle-option {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 10rpx;
   min-height: 58rpx;
   border-radius: 12rpx;
   color: $text-secondary;
   transition: all 0.2s;

   &.active {
      background: #fffaf5;
      border: 1rpx solid rgba(238, 134, 43, 0.36);
      color: $brand-primary;
      font-weight: 600;
      box-shadow: 0 4rpx 14rpx rgba(238, 134, 43, 0.12);

      .toggle-mark {
         background: $brand-primary;
         color: $uni-text-color-inverse;
      }
   }
}

.toggle-mark {
   width: 34rpx;
   height: 34rpx;
   border-radius: 50%;
   background: rgba(238, 134, 43, 0.12);
   color: $brand-primary;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 20rpx;
   font-weight: 700;
   line-height: 1;
}

.toggle-label {
   font-size: 25rpx;
   line-height: 34rpx;
}

.delivery-panel {
   margin-top: 0;
}

.delivery-hint {
   display: flex;
   align-items: center;
   gap: 16rpx;
   background: #fff7ed;
   border: 1rpx solid rgba(238, 134, 43, 0.22);
   border-radius: 12rpx;
   padding: 16rpx 18rpx;
}

.hint-text {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 2rpx;
   min-width: 0;
}

.hint-title {
   font-size: 24rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 34rpx;
}

.hint-desc {
   font-size: 21rpx;
   color: $text-muted;
   line-height: 30rpx;
}

.hint-action {
   font-size: 22rpx;
   color: $brand-primary;
   font-weight: 600;
   padding: 8rpx 18rpx;
   background: $bg-card;
   border: 1rpx solid rgba(238, 134, 43, 0.28);
   border-radius: $radius-full;
   flex-shrink: 0;
}

.delivery-info {
   background: #f5fff8;
   border: 1rpx solid #ccefd7;
   border-radius: 12rpx;
   padding: 16rpx 18rpx;
}

.info-row {
   display: flex;
   align-items: flex-start;
   gap: 14rpx;
   padding: 3rpx 0;
}

.info-label {
   width: 58rpx;
   font-size: 21rpx;
   font-weight: 600;
   color: #16834b;
   line-height: 32rpx;
   flex-shrink: 0;
}

.info-text {
   flex: 1;
   min-width: 0;
   font-size: 23rpx;
   color: #166534;
   line-height: 32rpx;
   word-break: break-all;
}

.delivery-fee-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 2rpx 4rpx 0;
}

.fee-left {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
}

.fee-label {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}

.fee-threshold {
   font-size: 20rpx;
   color: $text-muted;
   line-height: 30rpx;
}

.fee-value {
   font-size: 26rpx;
   font-weight: 600;
   color: $text-primary;

   &.free {
      color: #16a34a;
   }
}

.reservation-section {
   display: flex;
   flex-direction: column;
   gap: 12rpx;
}

.reservation-title {
   font-size: 24rpx;
   font-weight: 600;
   color: $text-secondary;
   line-height: 34rpx;
   padding: 0 4rpx;
}

.reservation-picker-row {
   background: $bg-input;
   border-radius: 16rpx;
   border: 2rpx solid transparent;
   transition: all 0.2s;

   &.has-value {
      background: $bg-hover;
      border-color: rgba(165, 79, 27, 0.36);
   }
}

.reservation-picker-inner {
   display: flex;
   align-items: center;
   gap: 14rpx;
   padding: 22rpx 24rpx;
}

.reservation-icon {
   font-size: 32rpx;
   line-height: 1;
}

.reservation-value {
   flex: 1;
   font-size: 26rpx;
   color: $text-muted;

   &.set {
      color: $brand-primary;
      font-weight: 700;
      font-size: 34rpx;
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: 1rpx;
   }
}

.reservation-arrow {
   font-size: 24rpx;
   color: $text-muted;
}

.reservation-hint {
   font-size: 22rpx;
   color: $text-muted;
   line-height: 32rpx;
   padding: 0 4rpx;
}

.reservation-cake-hint {
   font-size: 22rpx;
   color: #92610a;
   background: #fef6ec;
   border: 1rpx solid rgba(245, 158, 11, 0.35);
   border-radius: 12rpx;
   padding: 12rpx 18rpx;
   line-height: 32rpx;
}

.reservation-unavailable {
   display: flex;
   flex-direction: column;
   gap: 4rpx;
   border-radius: 16rpx;
   padding: 24rpx;
   text-align: center;

   &.closed {
      background: $bg-input;
   }

   &.cake {
      background: #fdeeec;
      border: 1rpx solid rgba(239, 68, 68, 0.3);

      .reservation-unavailable-main {
         color: #b42318;
      }
   }
}

.reservation-unavailable-main {
   font-size: 26rpx;
   font-weight: 600;
   color: $text-secondary;
   line-height: 36rpx;
}

.reservation-unavailable-sub {
   font-size: 22rpx;
   color: $text-muted;
   line-height: 32rpx;
}

.remark-section {
   margin-top: 0;
}

.remark-input {
   width: 100%;
   height: 66rpx;
   background: $bg-page;
   border-radius: 12rpx;
   padding: 0 22rpx;
   font-size: 24rpx;
   color: $text-primary;
   box-sizing: border-box;
}
</style>
