<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { Orders } from '@/types';
import { getOrderDetail } from '@/api/orderApi';
import { formatPriceDisplay, formatDateTime } from '@/utils/format';
import { getStatusText, getStatusColor } from '@/composables/useOrder';
import Header from '@/components/common/Header.vue';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

const { headerHeight } = useHeaderHeight();

const order = ref<Orders | null>(null);
const loading = ref(true);
const orderId = ref('');

const actualAmount = computed(() => {
   if (!order.value) return 0;
   return Math.max(
      order.value.total_amount -
         (order.value.discount_amount ?? 0) -
         (order.value.wallet_deduct ?? 0),
      0,
   );
});

const statusColor = computed(() => (order.value ? getStatusColor(order.value.order_status) : ''));

const statusBgStyle = computed(() => {
   if (!order.value) return {};
   const hex = statusColor.value;
   // Create a darker variant by reducing each channel to ~60%
   const r = Math.round(parseInt(hex.slice(1, 3), 16) * 0.6);
   const g = Math.round(parseInt(hex.slice(3, 5), 16) * 0.6);
   const b = Math.round(parseInt(hex.slice(5, 7), 16) * 0.6);
   const dark = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
   return {
      background: `linear-gradient(135deg, ${hex} 0%, ${dark} 100%)`,
   };
});

const statusLabel = computed(() => {
   const labels: Record<string, string> = {
      pending: '等待接单',
      preparing: '制作中',
      ready: '可取餐',
      completed: '已完成',
      cancelled: '已取消',
   };
   return labels[order.value?.order_status ?? ''] ?? '';
});

const totalItemCount = computed(() => {
   if (!order.value?.oder_details) return 0;
   return order.value.oder_details.reduce((sum, item) => sum + item.quantity, 0);
});

const fetchOrder = async () => {
   loading.value = true;
   try {
      const data = await getOrderDetail(orderId.value);
      order.value = data;
   } catch {
      uni.showToast({ title: '获取订单失败', icon: 'none' });
   } finally {
      loading.value = false;
   }
};

onLoad(async options => {
   const id = options?.id;
   if (!id) {
      uni.showToast({ title: '订单不存在', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
      return;
   }
   orderId.value = id;
   await fetchOrder();
});
</script>

<template>
   <view class="detail-page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="订单详情" :show-back="true" />

      <view v-if="loading" class="state-view">
         <view class="loading-spinner" />
         <text class="state-label">加载中</text>
      </view>

      <view v-else-if="!order" class="state-view">
         <text class="state-empty-icon">?</text>
         <text class="state-label">订单不存在</text>
      </view>

      <scroll-view v-else scroll-y class="content-scroll">
         <!-- Status Banner -->
         <view class="status-banner" :style="statusBgStyle">
            <view class="status-bubble status-bubble-1" />
            <view class="status-bubble status-bubble-2" />
            <view class="status-banner-inner">
               <view class="status-dot-wrap">
                  <view class="status-pulse" />
                  <view class="status-dot" />
               </view>
               <text class="status-title">{{ getStatusText(order.order_status) }}</text>
               <text class="status-sub">{{ statusLabel }}</text>
            </view>
         </view>

         <!-- Order Meta Card -->
         <view class="section-card meta-card">
            <view class="meta-row">
               <text class="meta-key">订单号</text>
               <text class="meta-val mono">{{ order.order_id }}</text>
            </view>
            <view class="meta-divider" />
            <view class="meta-row">
               <text class="meta-key">下单时间</text>
               <text class="meta-val">{{ formatDateTime(order.created_at) }}</text>
            </view>
            <view class="meta-divider" />
            <view class="meta-row">
               <text class="meta-key">商品数量</text>
               <text class="meta-val">{{ totalItemCount }} 件</text>
            </view>
         </view>

         <!-- Product List Card -->
         <view class="section-card">
            <text class="section-heading">商品明细</text>
            <view
               v-for="(item, index) in order.oder_details"
               :key="item.product_id"
               class="product-entry"
               :class="{ 'has-divider': index < order.oder_details.length - 1 }"
            >
               <image class="product-thumb" :src="item.product_image" mode="aspectFill" />
               <view class="product-body">
                  <text class="product-title">{{ item.product_name }}</text>
                  <view v-if="Object.keys(item.specs).length > 0" class="spec-row">
                     <view v-for="(value, key) in item.specs" :key="key" class="spec-chip">
                        <text class="spec-val">{{ value }}</text>
                     </view>
                  </view>
                  <view class="product-bottom">
                     <view class="price-group">
                        <text class="product-price">{{
                           formatPriceDisplay(item.price - item.discount)
                        }}</text>
                        <text v-if="item.discount > 0" class="product-original-price">{{
                           formatPriceDisplay(item.price)
                        }}</text>
                     </view>
                     <text class="product-qty">x{{ item.quantity }}</text>
                  </view>
               </view>
            </view>
         </view>

         <!-- Fee Breakdown Card -->
         <view class="section-card">
            <text class="section-heading">费用明细</text>
            <view class="fee-row">
               <text class="fee-label">商品总价</text>
               <text class="fee-amount">{{ formatPriceDisplay(order.total_amount) }}</text>
            </view>
            <view v-if="order.discount_amount > 0" class="fee-row">
               <text class="fee-label">优惠减免</text>
               <text class="fee-amount discount"
                  >-{{ formatPriceDisplay(order.discount_amount) }}</text
               >
            </view>
            <view v-if="order.wallet_deduct > 0" class="fee-row">
               <text class="fee-label">余额抵扣</text>
               <text class="fee-amount discount"
                  >-{{ formatPriceDisplay(order.wallet_deduct) }}</text
               >
            </view>
            <view class="fee-divider" />
            <view class="fee-row final">
               <text class="fee-label final-label">实付金额</text>
               <view class="final-price-group">
                  <text class="final-currency">¥</text>
                  <text class="final-number">{{ actualAmount.toFixed(2) }}</text>
               </view>
            </view>
         </view>

         <!-- Bottom spacer with safe area -->
         <view class="scroll-bottom" />
      </scroll-view>
   </view>
</template>

<style lang="scss" scoped>
.detail-page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

/* ── Loading / Empty States ── */
.state-view {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding-top: 280rpx;
   gap: 24rpx;
}

.state-empty-icon {
   font-size: 56rpx;
   color: $text-muted;
}

.state-label {
   font-size: 28rpx;
   color: $text-muted;
}

.loading-spinner {
   width: 48rpx;
   height: 48rpx;
   border: 4rpx solid rgba(238, 134, 43, 0.15);
   border-top-color: $brand-primary;
   border-radius: 50%;
   animation: spin 0.7s linear infinite;
}

@keyframes spin {
   to {
      transform: rotate(360deg);
   }
}

/* ── Scroll Container ── */
.content-scroll {
   height: calc(100vh - var(--window-top, 0px));
}

/* ── Status Banner ── */
.status-banner {
   margin: 24rpx 24rpx 0;
   border-radius: 28rpx;
   position: relative;
   overflow: hidden;
}

.status-bubble {
   position: absolute;
   border-radius: 50%;
}

.status-bubble-1 {
   top: -40rpx;
   right: -40rpx;
   width: 200rpx;
   height: 200rpx;
   background-color: rgba(255, 255, 255, 0.08);
}

.status-bubble-2 {
   bottom: -60rpx;
   left: 40rpx;
   width: 160rpx;
   height: 160rpx;
   background-color: rgba(255, 255, 255, 0.05);
}

.status-banner-inner {
   position: relative;
   z-index: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   padding: 48rpx 32rpx 44rpx;
   gap: 8rpx;
}

.status-dot-wrap {
   position: relative;
   width: 24rpx;
   height: 24rpx;
   margin-bottom: 16rpx;
}

.status-dot {
   position: absolute;
   top: 0;
   left: 0;
   width: 24rpx;
   height: 24rpx;
   border-radius: 50%;
   background-color: #fff;
}

.status-pulse {
   position: absolute;
   top: -8rpx;
   left: -8rpx;
   width: 40rpx;
   height: 40rpx;
   border-radius: 50%;
   background-color: rgba(255, 255, 255, 0.3);
   animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
   0% {
      transform: scale(0.8);
      opacity: 1;
   }
   100% {
      transform: scale(2);
      opacity: 0;
   }
}

.status-title {
   font-size: 36rpx;
   font-weight: 700;
   color: #fff;
   letter-spacing: 2rpx;
   line-height: 50rpx;
}

.status-sub {
   font-size: 24rpx;
   color: rgba(255, 255, 255, 0.75);
   line-height: 34rpx;
   margin-top: 4rpx;
}

/* ── Section Card (shared) ── */
.section-card {
   margin: 20rpx 24rpx 0;
   padding: 32rpx;
   background-color: $bg-card;
   border-radius: 24rpx;
   box-shadow: $shadow-card;
}

.section-heading {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;
   margin-bottom: 28rpx;
   display: block;
}

/* ── Meta Card ── */
.meta-card {
   padding: 28rpx 32rpx;
}

.meta-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 12rpx 0;
}

.meta-key {
   font-size: 26rpx;
   color: $text-muted;
   line-height: 36rpx;
   flex-shrink: 0;
}

.meta-val {
   font-size: 26rpx;
   color: $text-primary;
   font-weight: 500;
   line-height: 36rpx;
   text-align: right;

   &.mono {
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: 0.5rpx;
   }
}

.meta-divider {
   height: 1rpx;
   background: linear-gradient(90deg, transparent, $border-light, transparent);
   margin: 4rpx 0;
}

/* ── Product List ── */
.product-entry {
   display: flex;
   gap: 24rpx;
   padding: 20rpx 0;

   &.has-divider {
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
   }
}

.product-thumb {
   width: 136rpx;
   height: 136rpx;
   border-radius: 20rpx;
   background-color: $bg-input;
   flex-shrink: 0;
}

.product-body {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   min-width: 0;
   padding: 4rpx 0;
}

.product-title {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 42rpx;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.spec-row {
   display: flex;
   flex-wrap: wrap;
   gap: 12rpx;
   margin-top: 4rpx;
}

.spec-chip {
   background-color: $brand-primary-light;
   padding: 6rpx 18rpx;
   border-radius: $radius-full;
}

.spec-val {
   font-size: 22rpx;
   color: $brand-primary;
   line-height: 32rpx;
}

.product-bottom {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-top: 8rpx;
}

.price-group {
   display: flex;
   align-items: baseline;
   gap: 10rpx;
}

.product-original-price {
   font-size: 22rpx;
   color: $text-muted;
   text-decoration: line-through;
   font-family: 'Plus Jakarta Sans', sans-serif;
   line-height: 30rpx;
}

.product-price {
   font-size: 28rpx;
   color: $text-primary;
   font-weight: 500;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.product-qty {
   font-size: 26rpx;
   color: $text-muted;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Fee Breakdown ── */
.fee-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 10rpx 0;
}

.fee-label {
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 40rpx;
}

.fee-amount {
   font-size: 28rpx;
   color: $text-secondary;
   font-family: 'Plus Jakarta Sans', sans-serif;
   line-height: 40rpx;

   &.discount {
      color: $badge-error;
   }
}

.fee-divider {
   height: 1rpx;
   background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
   margin: 20rpx 0;
}

.fee-row.final {
   padding: 16rpx 0 4rpx;
}

.final-label {
   font-size: 30rpx;
   font-weight: 600;
   color: $text-primary;
}

.final-price-group {
   display: flex;
   align-items: baseline;
}

.final-currency {
   font-size: 28rpx;
   font-weight: 600;
   color: $brand-primary;
   margin-right: 4rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

.final-number {
   font-size: 44rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 52rpx;
   font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Bottom Safe Spacer ── */
.scroll-bottom {
   height: calc(48rpx + env(safe-area-inset-bottom));
}
</style>
