<script setup lang="ts">
import { computed } from 'vue';
import { formatPrice } from '@/utils/format';
import { useUserLevel } from '@/composables/useUserLevel';

interface Props {
   balance: number;
   isVip: boolean;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.isVip));

const emit = defineEmits<{
   'click:balance': [];
}>();
</script>

<template>
   <view
      class="stats-container"
      :style="{
         borderColor: levelConfig.color,
         ...(levelConfig.isVip ? { boxShadow: `0 2rpx 16rpx ${levelConfig.lightBg}` } : {}),
      }"
   >
      <view class="stat-item" @click="emit('click:balance')">
         <text class="stat-label">我的余额</text>
         <view class="stat-value-row">
            <text
               class="stat-value"
               :style="levelConfig.color ? { color: levelConfig.color } : {}"
               >{{ formatPrice(balance) }}</text
            >
            <text class="stat-unit">元</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.stats-container {
   display: flex;
   gap: 24rpx;
   border-left: 6rpx solid transparent;
   transition: border-color 0.2s ease;
}

.stat-item {
   flex: 1;
   background-color: $bg-card;
   border-radius: $radius-lg;
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   padding: 32rpx;
   box-shadow: $shadow-card;
   border: 1rpx solid rgba(113, 52, 20, 0.06);
   gap: 12rpx;

   &:active {
      opacity: 0.7;
   }
}

.stat-label {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.stat-value-row {
   display: flex;
   align-items: baseline;
   gap: 8rpx;
}

.stat-value {
   font-size: 44rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 60rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.stat-unit {
   font-size: 24rpx;
   color: $text-secondary;
   line-height: 34rpx;
}
</style>
