<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { formatPrice } from '@/utils/format';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();

const isVip = computed(() => userStore.isVip);

const cardNo = ref('');
const isRedeeming = ref(false);
const errorMessage = ref('');

const redeemResult = ref<{ amount: number } | null>(null);
const wasVipBeforeRedeem = ref(false);
const isSuccess = computed(() => redeemResult.value !== null);

const canSubmit = computed(() => cardNo.value.trim().length > 0 && !isRedeeming.value);

const displayAmount = computed(() =>
   redeemResult.value ? formatPrice(redeemResult.value.amount) : '',
);

function handleInput(e: InputEvent): void {
   const detail = e.detail as unknown as { value: string };
   cardNo.value = detail.value;
   errorMessage.value = '';
}

async function handleRedeem(): Promise<void> {
   const trimmed = cardNo.value.trim();

   if (!trimmed) {
      errorMessage.value = '请输入卡号';
      return;
   }

   if (isRedeeming.value) return;

   isRedeeming.value = true;
   wasVipBeforeRedeem.value = isVip.value;
   errorMessage.value = '';

   try {
      const result = await userStore.redeemVipCard(trimmed);
      if (result.success && result.data) {
         redeemResult.value = { amount: result.data.amount };
      } else {
         errorMessage.value = result.message;
      }
   } catch {
      errorMessage.value = '兑换失败，请稍后重试';
   } finally {
      isRedeeming.value = false;
   }
}

function handleBack(): void {
   uni.navigateBack();
}
</script>

<template>
   <view class="redeem-page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="会员卡兑换" :show-back="true" />

      <view class="page-content">
         <!-- Card illustration -->
         <view class="card-illustration">
            <view class="card-shine"></view>
            <view class="card-decoration">
               <view class="card-circle"></view>
               <view class="card-circle card-circle--overlap"></view>
            </view>
            <text class="card-brand">甜品屋 · 会员</text>
            <text class="card-title">会员卡兑换</text>
            <text class="card-hint">输入卡号，即刻激活您的专属权益</text>
         </view>

         <!-- Form section -->
         <view v-if="!isSuccess" class="form-card">
            <text class="form-title">输入卡号</text>
            <view class="input-group">
               <text class="input-label">卡号</text>
               <view class="input-wrap" :class="{ 'input-wrap--error': errorMessage }">
                  <image
                     class="input-icon"
                     src="/static/icons/menu/menu-coupons.svg"
                     mode="aspectFit"
                  />
                  <input
                     class="input-field"
                     type="text"
                     placeholder="请输入会员卡号"
                     :value="cardNo"
                     @input="handleInput"
                     :disabled="isRedeeming"
                  />
               </view>
               <text v-if="errorMessage" class="input-error">{{ errorMessage }}</text>
               <text v-else class="input-helper">卡号通常印在实体卡背面，由字母和数字组成</text>
            </view>
         </view>

         <!-- Success section -->
         <view v-if="isSuccess" class="success-card">
            <view class="success-icon">
               <text class="success-check">✓</text>
            </view>
            <text class="success-title">兑换成功</text>
            <view class="success-amount-row">
               <text class="success-amount">+{{ displayAmount }}</text>
               <text class="success-unit">元</text>
            </view>
            <text class="success-desc">已充入您的账户余额</text>
            <view v-if="!wasVipBeforeRedeem" class="success-vip-badge">
               <text class="vip-badge-text">★ 已成为会员用户</text>
            </view>
         </view>

         <!-- Submit button -->
         <view
            v-if="!isSuccess"
            class="submit-btn"
            :class="{ disabled: !canSubmit, loading: isRedeeming }"
            @click="handleRedeem"
         >
            <text class="submit-text">{{ isRedeeming ? '兑换中...' : '兑换' }}</text>
         </view>

         <!-- Back button (success state) -->
         <view v-if="isSuccess" class="back-btn" @click="handleBack">
            <text class="back-text">返回个人中心</text>
         </view>

         <!-- Rules -->
         <view class="rules-card">
            <text class="rules-title">兑换须知</text>
            <view class="rules-list">
               <view class="rule-item">
                  <view class="rule-dot"></view>
                  <text class="rule-text">每张会员卡仅可兑换一次，兑换后卡号失效</text>
               </view>
               <view class="rule-item">
                  <view class="rule-dot"></view>
                  <text class="rule-text">卡面值将自动充入您的账户余额</text>
               </view>
               <view class="rule-item">
                  <view class="rule-dot"></view>
                  <text class="rule-text">首次兑换成功后自动成为会员</text>
               </view>
               <view class="rule-item">
                  <view class="rule-dot"></view>
                  <text class="rule-text">如有疑问请联系门店工作人员</text>
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.redeem-page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

.page-content {
   padding: 32rpx 24rpx;
   display: flex;
   flex-direction: column;
   gap: 24rpx;
}

/* Card illustration */
.card-illustration {
   background: linear-gradient(135deg, #d97706, #f59e0b 40%, #fbbf24 70%, #fde68a);
   border-radius: $radius-xl;
   padding: 48rpx 40rpx;
   position: relative;
   overflow: hidden;
   box-shadow: 0 16rpx 48rpx rgba(217, 119, 6, 0.2);
}

.card-shine {
   position: absolute;
   top: 0;
   left: -50%;
   width: 50%;
   height: 100%;
   background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
   transform: skewX(-15deg);
}

.card-decoration {
   position: absolute;
   top: 36rpx;
   right: 40rpx;
   display: flex;
   gap: 16rpx;
}

.card-circle {
   width: 56rpx;
   height: 56rpx;
   border-radius: 50%;
   background: rgba(255, 255, 255, 0.2);

   &--overlap {
      margin-left: -24rpx;
      background: rgba(255, 255, 255, 0.12);
   }
}

.card-brand {
   font-size: 24rpx;
   font-weight: 600;
   color: rgba(255, 255, 255, 0.9);
   letter-spacing: 4rpx;
}

.card-title {
   display: block;
   font-size: 40rpx;
   font-weight: 700;
   color: #ffffff;
   margin-top: 20rpx;
   position: relative;
   z-index: 1;
}

.card-hint {
   display: block;
   font-size: 24rpx;
   color: rgba(255, 255, 255, 0.75);
   margin-top: 10rpx;
   position: relative;
   z-index: 1;
}

/* Form card */
.form-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 32rpx;
   box-shadow: $shadow-card;
}

.form-title {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   margin-bottom: 24rpx;
}

.input-group {
   display: flex;
   flex-direction: column;
}

.input-label {
   font-size: 26rpx;
   color: $text-secondary;
   margin-bottom: 12rpx;
}

.input-wrap {
   display: flex;
   align-items: center;
   background-color: $bg-page;
   border-radius: $radius-md;
   border: 2rpx solid $border-default;
   padding: 0 24rpx;
   transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

   &:focus-within {
      border-color: $brand-primary;
      background-color: $bg-card;
   }

   &--error {
      border-color: $badge-error;
   }
}

.input-icon {
   width: 36rpx;
   height: 36rpx;
   opacity: 0.4;
   margin-right: 16rpx;
   flex-shrink: 0;
}

.input-field {
   flex: 1;
   padding: 24rpx 0;
   font-size: 30rpx;
   color: $text-primary;
   letter-spacing: 2rpx;
}

.input-error {
   font-size: 24rpx;
   color: $badge-error;
   margin-top: 12rpx;
}

.input-helper {
   font-size: 24rpx;
   color: $text-muted;
   margin-top: 12rpx;
}

/* Success card */
.success-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 48rpx 32rpx;
   box-shadow: $shadow-card;
   display: flex;
   flex-direction: column;
   align-items: center;
}

.success-icon {
   width: 112rpx;
   height: 112rpx;
   border-radius: 50%;
   background: linear-gradient(135deg, #22c55e, #16a34a);
   display: flex;
   align-items: center;
   justify-content: center;
   margin-bottom: 24rpx;
}

.success-check {
   font-size: 52rpx;
   color: #ffffff;
}

.success-title {
   font-size: 36rpx;
   font-weight: 600;
   color: $text-primary;
}

.success-amount-row {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
   margin-top: 20rpx;
}

.success-amount {
   font-size: 72rpx;
   font-weight: 700;
   color: #d97706;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.success-unit {
   font-size: 30rpx;
   color: $text-secondary;
}

.success-desc {
   font-size: 26rpx;
   color: $text-muted;
   margin-top: 8rpx;
}

.success-vip-badge {
   margin-top: 24rpx;
   padding: 10rpx 28rpx;
   border-radius: $radius-full;
   background: linear-gradient(135deg, #fffbeb, #fef3c7);
   border: 2rpx solid #fde68a;
}

.vip-badge-text {
   font-size: 26rpx;
   font-weight: 500;
   color: #b45309;
}

/* Buttons */
.submit-btn {
   padding: 28rpx;
   background-color: $brand-primary;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: opacity 0.2s ease;

   &:active:not(.disabled):not(.loading) {
      transform: scale(0.97);
   }

   &.disabled {
      opacity: 0.4;
   }

   &.loading {
      opacity: 0.7;
   }
}

.submit-text {
   font-size: 30rpx;
   font-weight: 600;
   color: $uni-text-color-inverse;
}

.back-btn {
   padding: 28rpx;
   background-color: $bg-card;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;
   border: 2rpx solid $border-default;

   &:active {
      background-color: $bg-hover;
   }
}

.back-text {
   font-size: 28rpx;
   font-weight: 500;
   color: $text-secondary;
}

/* Rules card */
.rules-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 28rpx 32rpx;
   box-shadow: $shadow-sm;
}

.rules-title {
   font-size: 28rpx;
   font-weight: 600;
   color: $text-primary;
   margin-bottom: 16rpx;
}

.rules-list {
   display: flex;
   flex-direction: column;
   gap: 12rpx;
}

.rule-item {
   display: flex;
   align-items: flex-start;
   gap: 12rpx;
}

.rule-dot {
   width: 8rpx;
   height: 8rpx;
   border-radius: 50%;
   background-color: $border-default;
   flex-shrink: 0;
   margin-top: 14rpx;
}

.rule-text {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 36rpx;
}
</style>
