<script setup lang="ts">
import { computed } from 'vue';
import type { Orders } from '@/types';
import { getStatusText, getStatusColor } from '@/composables/useOrder';
import { hexToRgba } from '@/utils/color';
import { formatDateTime, formatPriceDisplay } from '@/utils/format';
import { calcOrderActualAmount } from '@/utils/orderAmount';

interface Props {
   order: Orders;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Orders];
}>();

const statusColor = computed(() => getStatusColor(props.order.order_status));

const firstThumb = computed(() => {
   const items = props.order.order_details ?? [];
   return items[0]?.product_image ?? '';
});

const itemsSummary = computed(() => {
   const items = props.order.order_details ?? [];
   if (items.length === 0) return '';
   return items.map(item => `${item.product_name} x${item.quantity}`).join(', ');
});

const userIdTail = computed(() => {
   const id = props.order.user_id ?? '';
   return id.length >= 4 ? id.slice(-4) : id;
});

const statusHint = computed(() => {
   const hints: Record<string, string> = {
      pending: '等待商家处理',
      preparing: '正在为您制作',
      ready: '请前往取餐',
   };
   return hints[props.order.order_status] ?? '';
});

const actualAmount = computed(() => calcOrderActualAmount(props.order));

const statusDotStyle = computed(() => ({
   backgroundColor: statusColor.value,
}));

const statusTextStyle = computed(() => ({
   color: statusColor.value,
}));

const statusTagStyle = computed(() => ({
   backgroundColor: hexToRgba(statusColor.value, 0.12),
}));

const footerStyle = computed(() => ({
   backgroundColor: hexToRgba(statusColor.value, 0.06),
   borderTopColor: hexToRgba(statusColor.value, 0.1),
}));

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
            <view class="title-row">
               <text class="items-summary">{{ itemsSummary }}</text>
               <view class="status-tag" :style="statusTagStyle">
                  <view class="status-dot" :style="statusDotStyle" />
                  <text class="status-text" :style="statusTextStyle">{{
                     getStatusText(order.order_status)
                  }}</text>
               </view>
            </view>

            <view class="info-grid">
               <view class="info-item">
                  <text class="info-label">用户尾号</text>
                  <text class="info-value">{{ userIdTail || '-' }}</text>
               </view>
               <view class="info-item">
                  <text class="info-label">下单时间</text>
                  <text class="info-value">{{ formatDateTime(order.created_at) }}</text>
               </view>
               <view class="info-item order-no-item">
                  <text class="info-label">订单号</text>
                  <text class="info-value order-id">#{{ order.order_id }}</text>
               </view>
               <view v-if="order.expected_time" class="info-item order-no-item">
                  <text class="info-label">预约时间</text>
                  <text class="info-value">{{ order.expected_time }}</text>
               </view>
            </view>
         </view>
      </view>
      <view class="card-footer" :style="footerStyle">
         <view class="amount-block">
            <text class="amount-label">实付金额</text>
            <text class="amount-text">{{ formatPriceDisplay(actualAmount) }}</text>
         </view>
         <view class="progress-hint">
            <view class="progress-dot" :style="statusDotStyle" />
            <text class="progress-text" :style="hintStyle">{{ statusHint }}</text>
         </view>
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
   gap: 22rpx;
   padding: 30rpx 28rpx 28rpx;
}

.product-thumb {
   width: 148rpx;
   height: 148rpx;
   border-radius: 20rpx;
   background-color: $bg-input;
   flex-shrink: 0;
}

.card-body {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 16rpx;
   min-width: 0;
}

.title-row {
   display: flex;
   align-items: flex-start;
   gap: 14rpx;
}

.items-summary {
   flex: 1;
   min-width: 0;
   font-size: 28rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 40rpx;
   overflow: hidden;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
}

.info-grid {
   display: flex;
   flex-wrap: wrap;
   gap: 8rpx 20rpx;
}

.info-item {
   width: calc((100% - 20rpx) / 2);
   min-width: 0;
}

.order-no-item {
   width: 100%;
}

.info-label {
   display: block;
   font-size: 20rpx;
   color: $text-muted;
   line-height: 28rpx;
}

.info-value {
   display: block;
   margin-top: 2rpx;
   font-size: 22rpx;
   color: $text-secondary;
   line-height: 30rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.order-id {
   color: $text-secondary;
}

.status-tag {
   display: flex;
   align-items: center;
   gap: 8rpx;
   border-radius: $radius-full;
   padding: 6rpx 14rpx;
   flex-shrink: 0;
}

.status-dot {
   width: 14rpx;
   height: 14rpx;
   border-radius: 50%;
}

.status-text {
   font-size: 22rpx;
   font-weight: 600;
   line-height: 30rpx;
}

.card-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 16rpx;
   min-height: 96rpx;
   padding: 20rpx 28rpx 24rpx;
   border-top: 1rpx solid transparent;
}

.amount-block {
   flex-shrink: 0;
}

.amount-label {
   display: block;
   font-size: 20rpx;
   color: $text-muted;
   line-height: 28rpx;
}

.amount-text {
   display: block;
   margin-top: 2rpx;
   font-size: 32rpx;
   font-weight: 700;
   color: $text-primary;
   line-height: 38rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.progress-hint {
   flex: 1;
   min-width: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8rpx;
}

.progress-dot {
   width: 12rpx;
   height: 12rpx;
   border-radius: 50%;
   flex-shrink: 0;
}

.progress-text {
   font-size: 24rpx;
   font-weight: 600;
   line-height: 34rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.detail-btn {
   flex-shrink: 0;
   background-color: $brand-primary;
   border-radius: 16rpx;
   padding: 14rpx 34rpx;
   box-shadow: 0 2rpx 4rpx 0 rgba(238, 134, 43, 0.2);
}

.detail-btn-text {
   font-size: 24rpx;
   color: $uni-text-color-inverse;
   font-weight: 500;
   line-height: 34rpx;
}
</style>
