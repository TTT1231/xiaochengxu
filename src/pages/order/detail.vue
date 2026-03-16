<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { Orders } from '@/types';
import { ORDER_STATUS_TEXT } from '@/types';
import { getOrderDetail, cancelOrder } from '@/api/orderApi';
import { formatPriceDisplay, formatDateTime } from '@/utils/format';
import Header from '@/components/common/Header.vue';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

const { headerHeight } = useHeaderHeight();

const order = ref<Orders | null>(null);
const loading = ref(true);
const cancelling = ref(false);

const orderId = ref('');

/** 是否可取消（仅 pending 状态） */
const canCancel = computed(() => order.value?.order_status === 'pending');

/** 实付金额 */
const actualAmount = computed(() => {
   if (!order.value) return 0;
   return order.value.total_amount - (order.value.discount_amount ?? 0);
});

/** 获取状态颜色 */
const getStatusColor = (status: string): string => {
   const map: Record<string, string> = {
      pending: '#f59e0b',
      preparing: '#3b82f6',
      ready: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
   };
   return map[status] ?? '#6b7280';
};

/** 获取状态文本 */
const getStatusText = (status: string): string => {
   return (ORDER_STATUS_TEXT as Record<string, string>)[status] ?? status;
};

/** 加载订单数据 */
const fetchOrder = async () => {
   loading.value = true;
   try {
      const data = await getOrderDetail(orderId.value);
      order.value = data;
   } catch (err) {
      console.error('获取订单详情失败:', err);
      uni.showToast({ title: '获取订单失败', icon: 'none' });
   } finally {
      loading.value = false;
   }
};

/** 取消订单 */
const handleCancelOrder = () => {
   uni.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: async res => {
         if (!res.confirm || !orderId.value) return;
         cancelling.value = true;
         try {
            await cancelOrder(orderId.value);
            await fetchOrder();
            uni.showToast({ title: '订单已取消', icon: 'success' });
         } catch (err) {
            console.error('取消订单失败:', err);
            uni.showToast({ title: '取消失败', icon: 'none' });
         } finally {
            cancelling.value = false;
         }
      },
   });
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

      <!-- Loading -->
      <view v-if="loading" class="state-view">
         <view class="loading-spinner" />
         <text class="state-label">加载中</text>
      </view>

      <!-- 订单不存在 -->
      <view v-else-if="!order" class="state-view">
         <text class="state-icon">?</text>
         <text class="state-label">订单不存在</text>
      </view>

      <!-- 订单内容 -->
      <scroll-view v-else scroll-y class="content-scroll">
         <!-- 状态横幅 -->
         <view
            class="status-hero"
            :style="{
               backgroundColor: getStatusColor(order.order_status) + '0d',
               borderBottomColor: getStatusColor(order.order_status) + '20',
            }"
         >
            <view
               class="status-icon-ring"
               :style="{ borderColor: getStatusColor(order.order_status) + '30' }"
            >
               <text class="status-icon" :style="{ color: getStatusColor(order.order_status) }">
                  {{
                     order.order_status === 'pending'
                        ? '⏳'
                        : order.order_status === 'preparing'
                          ? '🔥'
                          : order.order_status === 'ready'
                            ? '✅'
                            : order.order_status === 'completed'
                              ? '📦'
                              : '✕'
                  }}
               </text>
            </view>
            <text class="status-title" :style="{ color: getStatusColor(order.order_status) }">
               {{ getStatusText(order.order_status) }}
            </text>
         </view>

         <!-- 订单元信息 -->
         <view class="meta-strip">
            <view class="meta-item">
               <text class="meta-key">订单号</text>
               <text class="meta-val">{{ order.order_id }}</text>
            </view>
            <view class="meta-sep" />
            <view class="meta-item">
               <text class="meta-key">下单时间</text>
               <text class="meta-val">{{ formatDateTime(order.created_at) }}</text>
            </view>
         </view>

         <!-- 商品清单 -->
         <view class="section-card">
            <text class="section-heading">商品明细</text>
            <view
               v-for="(item, index) in order.oder_details"
               :key="item.product_id"
               class="product-entry"
               :class="{ 'has-border': index < order.oder_details.length - 1 }"
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
                     <text class="product-price">{{ formatPriceDisplay(item.price) }}</text>
                     <text class="product-qty">x{{ item.quantity }}</text>
                  </view>
               </view>
            </view>
         </view>

         <!-- 价格汇总 -->
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
            <view class="fee-divider" />
            <view class="fee-row final">
               <text class="fee-label final-label">实付金额</text>
               <view class="final-price-group">
                  <text class="final-currency">¥</text>
                  <text class="final-number">{{ actualAmount.toFixed(2) }}</text>
               </view>
            </view>
         </view>

         <!-- 取消订单 -->
         <view v-if="canCancel" class="action-dock">
            <view
               class="cancel-action"
               :class="{ disabled: cancelling }"
               @click="!cancelling && handleCancelOrder()"
            >
               <text class="cancel-action-text">{{ cancelling ? '取消中...' : '取消订单' }}</text>
            </view>
         </view>

         <!-- 底部留白 -->
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

/* ── 通用状态 ── */
.state-view {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding-top: 280rpx;
   gap: 24rpx;
}

.state-icon {
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

/* ── 滚动容器 ── */
.content-scroll {
   height: calc(100vh - var(--window-top, 0px));
}

/* ── 状态横幅 ── */
.status-hero {
   display: flex;
   flex-direction: column;
   align-items: center;
   padding: 56rpx 32rpx 48rpx;
   margin: 24rpx 24rpx 0;
   border-radius: 28rpx;
   border-bottom: 2rpx solid transparent;
}

.status-icon-ring {
   width: 112rpx;
   height: 112rpx;
   border-radius: 50%;
   border: 3rpx solid;
   display: flex;
   align-items: center;
   justify-content: center;
   margin-bottom: 20rpx;
}

.status-icon {
   font-size: 48rpx;
   line-height: 1;
}

.status-title {
   font-size: 36rpx;
   font-weight: 600;
   letter-spacing: 2rpx;
}

/* ── 元信息条 ── */
.meta-strip {
   display: flex;
   align-items: center;
   margin: 20rpx 24rpx 0;
   padding: 28rpx 32rpx;
   background-color: $bg-card;
   border-radius: 20rpx;
   box-shadow: $shadow-sm;
}

.meta-item {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 8rpx;
}

.meta-key {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 32rpx;
}

.meta-val {
   font-size: 28rpx;
   color: $text-primary;
   font-weight: 500;
   line-height: 38rpx;
}

.meta-sep {
   width: 2rpx;
   height: 56rpx;
   background-color: rgba(0, 0, 0, 0.06);
   margin: 0 32rpx;
   flex-shrink: 0;
}

/* ── 通用卡片 ── */
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

/* ── 商品列表 ── */
.product-entry {
   display: flex;
   gap: 24rpx;
   padding: 20rpx 0;

   &.has-border {
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
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

/* ── 费用明细 ── */
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
      color: #ef4444;
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

/* ── 操作区 ── */
.action-dock {
   margin: 32rpx 24rpx 0;
}

.cancel-action {
   padding: 28rpx 0;
   text-align: center;
   border-radius: 24rpx;
   background-color: $bg-card;
   border: 2rpx solid rgba(238, 134, 43, 0.25);
   box-shadow: $shadow-sm;

   &.disabled {
      opacity: 0.45;
   }

   &:active:not(.disabled) {
      background-color: #fefcfb;
   }
}

.cancel-action-text {
   font-size: 30rpx;
   color: $brand-primary;
   font-weight: 500;
   line-height: 42rpx;
}

/* ── 滚动底部留白 ── */
.scroll-bottom {
   height: calc(48rpx + env(safe-area-inset-bottom));
}
</style>
