<script setup lang="ts">
import type { Order } from '@/types';
import { getStatusText, getStatusClass } from '@/composables/useOrder';

const props = defineProps<{
   order: Order;
}>();

const emit = defineEmits<{
   click: [order: Order];
}>();

const handleCardClick = () => {
   emit('click', props.order);
};
</script>

<template>
   <view class="order-card" @click="handleCardClick">
      <view class="card-top">
         <image class="store-image" :src="order.storeImage" mode="aspectFill" />
         <view class="card-content">
            <view class="content-header">
               <text class="store-name">{{ order.storeName }}</text>
               <text class="arrow">›</text>
            </view>
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <view class="status-row">
               <view
                  class="status-dot"
                  :class="getStatusClass(order.status)"
               ></view>
               <text class="status-text" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
               </text>
            </view>
         </view>
      </view>

      <view class="card-divider" />

      <view class="card-footer">
         <text class="time-text"
            >预计 {{ order.estimatedTime || '15 分钟' }}后可取</text
         >
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
   display: flex;
   gap: 24rpx;
   padding: 32rpx 32rpx 24rpx;
}

.store-image {
   width: 140rpx;
   height: 140rpx;
   border-radius: 16rpx;
   background-color: $bg-hover;
   flex-shrink: 0;
}

.card-content {
   flex: 1;
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

.store-name {
   font-size: 32rpx;
   font-weight: 600;
   color: #1e293b;
   line-height: 44rpx;
   flex: 1;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.arrow {
   font-size: 36rpx;
   color: #94a3b8;
   margin-left: 8rpx;
}

.order-no {
   font-size: 26rpx;
   color: #64748b;
   line-height: 36rpx;
   margin-bottom: 12rpx;
}

.status-row {
   display: flex;
   align-items: center;
   gap: 8rpx;
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
}

.status-text {
   font-size: 26rpx;
   &.status-preparing,
   &.status-pending {
      color: $brand-primary;
   }
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

.time-text {
   font-size: 26rpx;
   color: #64748b;
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
