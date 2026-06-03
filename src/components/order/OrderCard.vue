<script setup lang="ts">
import { computed } from 'vue';
import type { Orders } from '@/types';
import { getStatusText, getStatusColor } from '@/composables/useOrder';

interface Props {
   order: Orders;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Orders];
}>();

const statusColor = computed(() => getStatusColor(props.order.order_status));

const firstThumb = computed(() => {
   const items = props.order.oder_details ?? [];
   return items[0]?.product_image ?? '';
});

const itemsSummary = computed(() => {
   const items = props.order.oder_details ?? [];
   if (items.length === 0) return '';
   return items.map(item => `${item.product_name} x${item.quantity}`).join(', ');
});

const statusHint = computed(() => {
   const hints: Record<string, string> = {
      pending: '等待商家接单',
      preparing: '正在为您制作',
      ready: '请前往取餐',
   };
   return hints[props.order.order_status] ?? '';
});

const statusDotStyle = computed(() => ({
   backgroundColor: statusColor.value,
}));

const statusTextStyle = computed(() => ({
   color: statusColor.value,
}));

const footerStyle = computed(() => {
   const hex = statusColor.value;
   const r = parseInt(hex.slice(1, 3), 16);
   const g = parseInt(hex.slice(3, 5), 16);
   const b = parseInt(hex.slice(5, 7), 16);
   return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.06)`,
      borderTopColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
   };
});

const hintStyle = computed(() => ({
   color: statusColor.value,
}));

const handleCardClick = () => {
   emit('click', props.order);
};
</script>

<template>
   <view class="order-card" @click="handleCardClick">
      <view class="card-main">
         <image v-if="firstThumb" class="product-thumb" :src="firstThumb" mode="aspectFill" />
         <view class="card-body">
            <text class="items-summary">{{ itemsSummary }}</text>
            <view class="meta-row">
               <text class="order-id">订单号: {{ order.order_id }}</text>
               <view class="status-tag">
                  <view class="status-dot" :style="statusDotStyle" />
                  <text class="status-text" :style="statusTextStyle">{{
                     getStatusText(order.order_status)
                  }}</text>
               </view>
            </view>
         </view>
      </view>
      <view class="card-footer" :style="footerStyle">
         <text class="pickup-hint" :style="hintStyle">{{ statusHint }}</text>
         <view class="detail-btn">
            <text class="detail-btn-text">查看详情</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.order-card {
   background-color: $bg-card;
   border-radius: 24rpx;
   overflow: hidden;
   box-shadow: $shadow-card;
   margin-bottom: 24rpx;
}

.card-main {
   display: flex;
   gap: 24rpx;
   padding: 28rpx 28rpx 24rpx;
}

.product-thumb {
   width: 136rpx;
   height: 136rpx;
   border-radius: 20rpx;
   background-color: $bg-input;
   flex-shrink: 0;
}

.card-body {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   min-width: 0;
}

.items-summary {
   font-size: 28rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 40rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.meta-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 16rpx;
}

.order-id {
   font-size: 22rpx;
   color: $text-muted;
   line-height: 30rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
   flex: 1;
   min-width: 0;
}

.status-tag {
   display: flex;
   align-items: center;
   gap: 8rpx;
   flex-shrink: 0;
}

.status-dot {
   width: 14rpx;
   height: 14rpx;
   border-radius: 50%;
}

.status-text {
   font-size: 24rpx;
   font-weight: 600;
   line-height: 34rpx;
}

.card-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 20rpx 28rpx;
   border-top: 1rpx solid transparent;
}

.pickup-hint {
   font-size: 24rpx;
   font-weight: 500;
   line-height: 34rpx;
}

.detail-btn {
   background-color: $brand-primary;
   border-radius: 16rpx;
   padding: 12rpx 28rpx;
   box-shadow: 0 2rpx 4rpx 0 rgba(238, 134, 43, 0.2);
}

.detail-btn-text {
   font-size: 24rpx;
   color: $uni-text-color-inverse;
   font-weight: 500;
   line-height: 34rpx;
}
</style>
