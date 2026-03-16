<script setup lang="ts">
import type { Orders } from '@/types';
import { getStatusText, getStatusClass } from '@/composables/useOrder';
import { formatPriceDisplay, formatDateTime } from '@/utils/format';

const props = defineProps<{
   order: Orders;
}>();

const emit = defineEmits<{
   click: [order: Orders];
}>();

const handleCardClick = () => {
   emit('click', props.order);
};
</script>

<template>
   <view class="order-card" @click="handleCardClick">
      <view class="card-top">
         <view class="card-content">
            <view class="content-header">
               <text class="order-id">订单号: {{ order.order_id }}</text>
               <view class="status-row">
                  <view class="status-dot" :class="getStatusClass(order.order_status)"></view>
                  <text class="status-text" :class="getStatusClass(order.order_status)">
                     {{ getStatusText(order.order_status) }}
                  </text>
               </view>
            </view>
            <text class="order-time">{{ formatDateTime(order.created_at) }}</text>
         </view>
      </view>

      <view class="card-divider" />

      <view class="card-footer">
         <text class="total-text">合计 {{ formatPriceDisplay(order.total_amount) }}</text>
         <view class="detail-btn">
            <text class="detail-text">查看详情</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.order-card {
   background-color: $bg-card;
   border-radius: 24rpx;
   padding: 0;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
}

.card-top {
   padding: 32rpx 32rpx 24rpx;
}

.card-content {
   display: flex;
   flex-direction: column;
   justify-content: flex-start;
   min-width: 0;
}

.content-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 8rpx;
}

.order-id {
   font-size: 28rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 40rpx;
   flex: 1;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.status-row {
   display: flex;
   align-items: center;
   gap: 8rpx;
   flex-shrink: 0;
   margin-left: 16rpx;
}

.status-dot {
   width: 12rpx;
   height: 12rpx;
   border-radius: 50%;

   &.status-preparing,
   &.status-pending {
      background-color: $brand-primary;
   }

   &.status-ready {
      background-color: $status-ready;
   }

   &.status-cancelled {
      background-color: #ef4444;
   }
}

.status-text {
   font-size: 26rpx;
   &.status-preparing,
   &.status-pending {
      color: $brand-primary;
   }

   &.status-ready {
      color: $status-ready;
   }

   &.status-cancelled {
      color: #ef4444;
   }
}

.order-time {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
}

.card-divider {
   height: 2rpx;
   background-color: rgba(0, 0, 0, 0.04);
}

.card-footer {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 24rpx 32rpx;
   background-color: #fafafa;
   border-bottom-left-radius: 24rpx;
   border-bottom-right-radius: 24rpx;
}

.total-text {
   font-size: 30rpx;
   font-weight: 700;
   color: $text-primary;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.detail-btn {
   background-color: $brand-primary;
   border-radius: $radius-full;
   padding: 12rpx 32rpx;
}

.detail-text {
   font-size: 26rpx;
   color: #ffffff;
   font-weight: 500;
}
</style>
