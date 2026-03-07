<template>
   <view class="history-card" @click="handleCardClick">
      <view class="card-header">
         <text class="store-name">{{ order.storeName }}</text>
         <text class="order-no">{{ order.orderNo }}</text>
      </view>

      <view class="card-content">
         <view class="items-summary">
            <text class="summary-text">{{ getItemsSummary }}</text>
         </view>
      </view>

      <view class="card-footer">
         <text class="order-date">{{ formatDate(order.createdAt) }}</text>
         <view class="amount-info">
            <text class="amount-label">总计：</text>
            <text class="amount-value">¥{{ order.totalAmount }}</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Order } from '@/types';

interface Props {
   order: Order;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Order];
}>();

const getItemsSummary = computed(() => {
   const items = props.order.items;
   if (items.length === 0) return '无商品';
   if (items.length === 1) {
      return `${items[0].productName} x${items[0].quantity}`;
   }
   return `${items[0].productName} 等${items.length}件商品`;
});

const formatDate = (dateStr: string): string => {
   // Format: 2025-03-05 15:20:00 -> 03-05 15:20
   const match = dateStr.match(/\d{4}-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
   if (match) {
      return `${match[1]}-${match[2]} ${match[3]}:${match[4]}`;
   }
   return dateStr;
};

const handleCardClick = () => {
   emit('click', props.order);
};
</script>

<style lang="scss" scoped>
.history-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 24rpx;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
}

.card-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16rpx;
}

.store-name {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;
}

.order-no {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
}

.card-content {
   margin-bottom: 16rpx;
}

.items-summary {
   padding: 16rpx;
   background-color: $bg-page;
   border-radius: $radius-sm;
}

.summary-text {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.card-footer {
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.order-date {
   font-size: 24rpx;
   color: $text-tertiary;
   line-height: 34rpx;
}

.amount-info {
   display: flex;
   align-items: baseline;
}

.amount-label {
   font-size: 26rpx;
   color: $text-tertiary;
   margin-right: 4rpx;
}

.amount-value {
   font-size: 28rpx;
   font-weight: 500;
   color: $status-completed;
}
</style>
