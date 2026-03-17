<script setup lang="ts">
import { computed } from 'vue';
import type { Orders } from '@/types';
import { commonIcons } from '@/data/imgPaths';
import { formatPriceDisplay, formatDateTime } from '@/utils/format';

interface Props {
   order: Orders;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Orders];
   reorder: [order: Orders];
}>();

const itemsSummary = computed(() => {
   const items = props.order.oder_details ?? [];
   if (items.length === 0) return '';
   return items.map(item => `${item.product_name} x${item.quantity}`).join(', ');
});

const firstThumb = computed(() => {
   const items = props.order.oder_details ?? [];
   return items[0]?.product_image ?? '';
});
</script>

<template>
   <view class="history-card" @click="emit('click', order)">
      <view class="card-header">
         <view class="store-info">
            <image v-if="firstThumb" class="store-thumb" :src="firstThumb" mode="aspectFill" />
            <view class="store-text">
               <text class="order-time">{{ formatDateTime(order.created_at) }}</text>
            </view>
         </view>
         <text class="status-done">已完成</text>
      </view>

      <view class="card-divider" />

      <text class="items-summary">{{ itemsSummary }}</text>

      <view class="card-footer">
         <text class="price">{{ formatPriceDisplay(order.total_amount) }}</text>
         <view class="reorder-btn" @click.stop="emit('reorder', order)">
            <image class="refresh-icon" :src="commonIcons.refresh" mode="aspectFit" />
            <text class="reorder-text">再来一单</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.history-card {
   background-color: $bg-card;
   border-radius: 24rpx;
   padding: 28rpx;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
   display: flex;
   flex-direction: column;
}

.card-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.store-info {
   display: flex;
   align-items: center;
   gap: 16rpx;
   flex: 1;
   min-width: 0;
}

.store-thumb {
   width: 64rpx;
   height: 64rpx;
   border-radius: 16rpx;
   background-color: $bg-input;
   flex-shrink: 0;
}

.store-text {
   display: flex;
   flex-direction: column;
   min-width: 0;
}

.order-time {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
}

.status-done {
   font-size: 24rpx;
   color: $text-muted;
   flex-shrink: 0;
   margin-left: 16rpx;
}

.card-divider {
   height: 1rpx;
   background-color: $border-light;
   margin: 20rpx 0;
}

.items-summary {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.card-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-top: 20rpx;
}

.price {
   font-size: 28rpx;
   font-weight: 700;
   color: $text-primary;
   line-height: 40rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.reorder-btn {
   display: flex;
   align-items: center;
   gap: 8rpx;
   padding: 10rpx 28rpx;
   border: 2rpx solid rgba(238, 134, 43, 0.3);
   border-radius: 16rpx;
   background-color: $bg-card;
}

.refresh-icon {
   width: 24rpx;
   height: 24rpx;
}

.reorder-text {
   font-size: 24rpx;
   color: $brand-primary;
   font-weight: 500;
   line-height: 34rpx;
}
</style>
