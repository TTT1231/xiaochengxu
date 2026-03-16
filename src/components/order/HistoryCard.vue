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

const refreshIconSrc = commonIcons.refresh;

const getItemsSummary = computed(() => {
   const items = props.order.oder_details;
   if (!items || items.length === 0) return '';
   return items.map(item => `${item.product_name} x${item.quantity}`).join(', ');
});

const handleCardClick = () => {
   emit('click', props.order);
};

const handleReorder = () => {
   emit('reorder', props.order);
};
</script>

<template>
   <view class="history-card" @click="handleCardClick">
      <view class="content-header">
         <view class="order-info">
            <text class="order-id">{{ order.order_id }}</text>
            <text class="order-time">{{ formatDateTime(order.created_at) }}</text>
         </view>
         <text class="status-num">已完成</text>
      </view>

      <view class="card-divider" />

      <text class="items-summary">{{ getItemsSummary }}</text>

      <view class="card-footer">
         <text class="price">{{ formatPriceDisplay(order.total_amount) }}</text>
         <view class="reorder-btn" @click.stop="handleReorder">
            <image class="refresh-icon" :src="refreshIconSrc" mode="aspectFit" />
            <text class="reorder-text">再来一单</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.history-card {
   background-color: $bg-card;
   border-radius: 24rpx;
   padding: 32rpx;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
   display: flex;
   flex-direction: column;
}

.content-header {
   display: flex;
   align-items: flex-start;
   margin-bottom: 24rpx;
}

.order-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   min-width: 0;
}

.order-id {
   font-size: 28rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 40rpx;
   margin-bottom: 4rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.order-time {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
}

.status-num {
   font-size: 26rpx;
   color: $text-muted;
   margin-left: 16rpx;
   flex-shrink: 0;
}

.card-divider {
   height: 2rpx;
   background-color: rgba(0, 0, 0, 0.04);
   margin-bottom: 24rpx;
}

.items-summary {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
   margin-bottom: 32rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.card-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.price {
   font-size: 36rpx;
   font-weight: 700;
   color: $text-primary;
   line-height: 48rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.reorder-btn {
   display: flex;
   align-items: center;
   gap: 8rpx;
   padding: 10rpx 32rpx;
   border: 2rpx solid rgba(238, 134, 43, 0.3);
   border-radius: $radius-full;
   background-color: #fff;
}

.refresh-icon {
   width: 24rpx;
   height: 24rpx;
}

.reorder-text {
   font-size: 26rpx;
   color: $brand-primary;
   font-weight: 500;
}
</style>
