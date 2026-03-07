<template>
   <view class="order-card" @click="handleCardClick">
      <view class="store-info">
         <image class="store-image" :src="order.storeImage" mode="aspectFill" />
         <view class="store-details">
            <text class="store-name">{{ order.storeName }}</text>
            <view class="status-badge" :class="getStatusClass(order.status)">
               <text class="status-text">{{
                  getStatusText(order.status)
               }}</text>
            </view>
         </view>
      </view>

      <view class="order-items">
         <text
            v-for="(item, index) in order.items"
            :key="index"
            class="item-text"
         >
            {{ item.productName }} x{{ item.quantity }}
         </text>
      </view>

      <view class="order-footer">
         <view class="time-info">
            <text class="time-text">{{
               order.estimatedTime || '计算中...'
            }}</text>
         </view>
         <view class="amount-info">
            <text class="amount-label">总计：</text>
            <text class="amount-value">¥{{ order.totalAmount }}</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import type { Order } from '@/types';

interface Props {
   order: Order;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Order];
}>();

const getStatusText = (status: string): string => {
   const statusMap: Record<string, string> = {
      pending: '待处理',
      preparing: '制作中',
      ready: '待取餐',
      completed: '已完成',
   };
   return statusMap[status] || '未知';
};

const getStatusClass = (status: string): string => {
   return `status-${status}`;
};

const handleCardClick = () => {
   emit('click', props.order);
};
</script>

<style lang="scss" scoped>
.order-card {
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 24rpx;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
}

.store-info {
   display: flex;
   align-items: center;
   margin-bottom: 20rpx;
}

.store-image {
   width: 88rpx;
   height: 88rpx;
   border-radius: $radius-md;
   margin-right: 20rpx;
   background-color: $bg-hover;
}

.store-details {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 12rpx;
}

.store-name {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;
}

.status-badge {
   align-self: flex-start;
   padding: 8rpx 20rpx;
   border-radius: $radius-full;

   &.status-preparing {
      background-color: rgba($status-preparing, 0.1);
   }

   &.status-ready {
      background-color: rgba($status-ready, 0.1);
   }

   &.status-pending {
      background-color: rgba($status-pending, 0.1);
   }
}

.status-text {
   font-size: 24rpx;
   font-weight: 500;

   .status-preparing & {
      color: $status-preparing;
   }

   .status-ready & {
      color: $status-ready;
   }

   .status-pending & {
      color: $status-pending;
   }
}

.order-items {
   display: flex;
   flex-direction: column;
   gap: 8rpx;
   padding-left: 108rpx;
   margin-bottom: 20rpx;
}

.item-text {
   font-size: 26rpx;
   color: $text-secondary;
   line-height: 36rpx;
}

.order-footer {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding-left: 108rpx;
}

.time-info {
   display: flex;
   align-items: center;
}

.time-text {
   font-size: 24rpx;
   color: $text-tertiary;
}

.amount-info {
   display: flex;
   align-items: baseline;
}

.amount-label {
   font-size: 26rpx;
   color: $text-secondary;
   margin-right: 4rpx;
}

.amount-value {
   font-size: 32rpx;
   font-weight: 600;
   color: $brand-primary;
}
</style>
