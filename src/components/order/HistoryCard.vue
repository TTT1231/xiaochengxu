<script setup lang="ts">
import { computed } from 'vue';
import type { Orders } from '@/types';
import { commonIcons } from '@/data/imgPaths';
import { formatPriceDisplay, formatDateTime } from '@/utils/format';
import { calcOrderActualAmount } from '@/utils/orderAmount';
import { getStatusText, getStatusColor } from '@/composables/useOrder';
import { hexToRgba } from '@/utils/color';

interface Props {
   order: Orders;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   click: [order: Orders];
   reorder: [order: Orders];
}>();

const firstThumb = computed(() => {
   const items = props.order.order_details ?? [];
   return items[0]?.product_image ?? '';
});

const itemsSummary = computed(() => {
   const items = props.order.order_details ?? [];
   if (items.length === 0) return '订单商品';
   return items.map(item => `${item.product_name} x${item.quantity}`).join(', ');
});

const userIdTail = computed(() => {
   const id = props.order.user_id ?? '';
   return id.length >= 4 ? id.slice(-4) : id;
});

const actualAmount = computed(() => calcOrderActualAmount(props.order));

const statusColor = computed(() => getStatusColor(props.order.order_status));
const statusText = computed(() => getStatusText(props.order.order_status));

const statusTagStyle = computed(() => ({
   backgroundColor: hexToRgba(statusColor.value, 0.1),
}));

const statusDotStyle = computed(() => ({
   backgroundColor: statusColor.value,
}));

const statusTextStyle = computed(() => ({
   color: statusColor.value,
}));
</script>

<template>
   <view class="history-card" @click="emit('click', order)">
      <view class="card-main">
         <image v-if="firstThumb" class="product-thumb" :src="firstThumb" mode="aspectFill" />
         <view class="card-body">
            <view class="title-row">
               <text class="items-summary">{{ itemsSummary }}</text>
               <view class="status-tag" :style="statusTagStyle">
                  <view class="status-dot" :style="statusDotStyle" />
                  <text class="status-text" :style="statusTextStyle">{{ statusText }}</text>
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
                  <text class="info-value">#{{ order.order_id }}</text>
               </view>
               <view v-if="order.expected_time" class="info-item order-no-item">
                  <text class="info-label">预约时间</text>
                  <text class="info-value">{{ order.expected_time }}</text>
               </view>
            </view>
         </view>
      </view>

      <view class="fee-strip">
         <view class="fee-main">
            <text class="fee-label">实付金额</text>
            <text class="price">{{ formatPriceDisplay(actualAmount) }}</text>
         </view>
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
   overflow: hidden;
   margin-bottom: 24rpx;
   box-shadow: $shadow-card;
}

.card-main {
   display: flex;
   gap: 22rpx;
   padding: 28rpx;
}

.product-thumb {
   width: 132rpx;
   height: 132rpx;
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

.status-tag {
   display: flex;
   align-items: center;
   gap: 8rpx;
   flex-shrink: 0;
   border-radius: $radius-full;
   padding: 6rpx 16rpx;
}

.status-dot {
   width: 12rpx;
   height: 12rpx;
   border-radius: 50%;
}

.status-text {
   font-size: 22rpx;
   font-weight: 600;
   line-height: 30rpx;
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

.fee-strip {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 20rpx;
   padding: 18rpx 28rpx;
   background-color: rgba(238, 134, 43, 0.05);
   border-top: 1rpx solid rgba(238, 134, 43, 0.08);
}

.fee-main {
   flex-shrink: 0;
}

.fee-label {
   display: block;
   font-size: 20rpx;
   color: $text-muted;
   line-height: 28rpx;
}

.price {
   display: block;
   margin-top: 2rpx;
   font-size: 30rpx;
   font-weight: 700;
   color: $text-primary;
   line-height: 36rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.reorder-btn {
   display: flex;
   align-items: center;
   gap: 8rpx;
   padding: 10rpx 24rpx;
   border: 2rpx solid rgba(238, 134, 43, 0.3);
   border-radius: 16rpx;
   background-color: $bg-card;
   flex-shrink: 0;
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

@media (max-width: 380px) {
   .card-main {
      gap: 18rpx;
      padding: 24rpx;
   }

   .product-thumb {
      width: 120rpx;
      height: 120rpx;
   }

   .info-item,
   .order-no-item {
      width: 100%;
   }
}
</style>
