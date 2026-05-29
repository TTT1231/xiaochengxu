<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { useUserLevel } from '@/composables/useUserLevel';
import { formatPrice } from '@/utils/format';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();

const wallet = computed(() => userStore.wallet);
const isVip = computed(() => userStore.isVip);
const levelConfig = computed(() => useUserLevel(isVip.value));

const PRESET_AMOUNTS = [20, 30, 50];
const selectedAmount = ref<number | null>(null);
const customAmount = ref('');
const isRecharging = ref(false);

const displayBalance = computed(() => formatPrice(wallet.value?.balance ?? 0));

function selectAmount(amount: number): void {
   selectedAmount.value = amount;
   customAmount.value = '';
}

const rechargeAmount = computed(() => {
   if (selectedAmount.value) return selectedAmount.value;
   const parsed = parseFloat(customAmount.value);
   return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
});

async function handleRecharge(): Promise<void> {
   if (rechargeAmount.value <= 0 || isRecharging.value) return;

   isRecharging.value = true;
   try {
      const result = await userStore.recharge(rechargeAmount.value);
      if (result.success) {
         uni.showToast({ title: '充值成功', icon: 'success' });
         selectedAmount.value = null;
         customAmount.value = '';
      } else {
         uni.showToast({ title: result.message, icon: 'none' });
      }
   } catch {
      uni.showToast({ title: '充值失败', icon: 'none' });
   } finally {
      isRecharging.value = false;
   }
}
</script>

<template>
   <view class="wallet-page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="我的余额" :show-back="true" />

      <view class="page-content" :style="{ height: `calc(100vh - ${headerHeight}px)` }">
         <view
            class="balance-card"
            :style="{
               borderColor: levelConfig.color,
               ...(levelConfig.isVip ? { background: levelConfig.gradientBg } : {}),
            }"
         >
            <text class="balance-label">当前余额</text>
            <view class="balance-row">
               <text
                  class="balance-value"
                  :style="levelConfig.color ? { color: levelConfig.color } : {}"
                  >{{ displayBalance }}</text
               >
               <text class="balance-unit">元</text>
            </view>
            <view
               v-if="levelConfig.isVip"
               class="member-badge"
               :style="{ background: levelConfig.badgeGradient }"
            >
               <text class="member-text" :style="{ color: levelConfig.badgeTextColor }">{{
                  levelConfig.displayLabel
               }}</text>
            </view>
            <text v-else class="regular-label">{{ levelConfig.displayLabel }}</text>
         </view>

         <view class="recharge-section">
            <text class="section-title">充值金额</text>

            <view class="preset-grid">
               <view
                  v-for="amount in PRESET_AMOUNTS"
                  :key="amount"
                  class="preset-btn"
                  :class="{ active: selectedAmount === amount }"
                  @click="selectAmount(amount)"
               >
                  <text class="preset-text">{{ amount }}元</text>
               </view>
            </view>

            <view class="custom-input-wrap">
               <text class="custom-label">自定义金额</text>
               <input
                  class="custom-input"
                  type="digit"
                  placeholder="请输入金额"
                  :value="customAmount"
                  @input="
                     customAmount = ($event as any).detail.value;
                     selectedAmount = null;
                  "
               />
            </view>

            <view
               class="recharge-btn"
               :class="{ disabled: rechargeAmount <= 0 || isRecharging }"
               @click="handleRecharge"
            >
               <text class="recharge-text">{{ isRecharging ? '充值中...' : '充值' }}</text>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.wallet-page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

.page-content {
   display: flex;
   flex-direction: column;
   padding: 32rpx;
   gap: 32rpx;
}

.balance-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   border: 2rpx solid transparent;
   padding: 40rpx 32rpx;
   box-shadow: $shadow-card;
}

.balance-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.balance-row {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
   margin-top: 12rpx;
}

.balance-value {
   font-size: 64rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 80rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.balance-unit {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
}

.member-badge {
   align-self: flex-start;
   border-radius: $radius-full;
   padding: 6rpx 20rpx;
   margin-top: 16rpx;
}

.member-text {
   font-size: 22rpx;
   font-weight: 600;
   line-height: 30rpx;
   text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

.regular-label {
   font-size: 24rpx;
   color: $text-muted;
   margin-top: 16rpx;
}

.recharge-section {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 32rpx;
   box-shadow: $shadow-card;
}

.section-title {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 44rpx;
}

.preset-grid {
   display: flex;
   gap: 24rpx;
   margin-top: 24rpx;
}

.preset-btn {
   flex: 1;
   padding: 24rpx 0;
   background-color: $bg-page;
   border-radius: $radius-md;
   border: 2rpx solid $border-default;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.2s ease;

   &.active {
      background-color: rgba(238, 134, 43, 0.1);
      border-color: $brand-primary;
   }
}

.preset-text {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;

   .active & {
      color: $brand-primary;
   }
}

.custom-input-wrap {
   margin-top: 24rpx;
}

.custom-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.custom-input {
   margin-top: 12rpx;
   padding: 24rpx;
   background-color: $bg-page;
   border-radius: $radius-md;
   border: 2rpx solid $border-default;
   font-size: 28rpx;
   color: $text-primary;
}

.recharge-btn {
   margin-top: 32rpx;
   padding: 24rpx;
   background-color: $brand-primary;
   border-radius: $radius-full;
   display: flex;
   align-items: center;
   justify-content: center;

   &.disabled {
      opacity: 0.5;
   }
}

.recharge-text {
   font-size: 30rpx;
   font-weight: 600;
   color: $uni-text-color-inverse;
   line-height: 42rpx;
}
</style>
