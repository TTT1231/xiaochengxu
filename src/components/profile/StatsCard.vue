<script setup lang="ts">
import { computed } from 'vue';
import { formatPoints } from '@/utils/format';
import { useUserLevel } from '@/composables/useUserLevel';

interface Props {
   points: number;
   coupons: number;
   /** 用户等级，用于左侧竖线颜色 */
   level?: string;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.level ?? '普通会员'));

const emit = defineEmits<{
   'click:points': [];
   'click:coupons': [];
}>();
</script>

<template>
   <view
      class="stats-container"
      :style="{
         borderColor: levelConfig.color,
         ...(levelConfig.isVip
            ? { boxShadow: `0 2rpx 16rpx ${levelConfig.lightBg}` }
            : {}),
      }"
   >
      <view class="stat-item" @click="emit('click:points')">
         <text class="stat-label">我的积分</text>
         <view class="stat-value-row">
            <text
               class="stat-value"
               :style="levelConfig.color ? { color: levelConfig.color } : {}"
               >{{ formatPoints(points) }}</text
            >
            <text class="stat-unit">分</text>
         </view>
      </view>
      <view class="stat-item" @click="emit('click:coupons')">
         <text class="stat-label">优惠券</text>
         <view class="stat-value-row">
            <text class="stat-value">{{ coupons.toLocaleString() }}</text>
            <text class="stat-unit">张</text>
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
