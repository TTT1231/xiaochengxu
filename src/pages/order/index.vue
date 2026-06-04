<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import OrderToggle from '@/components/order/OrderToggle.vue';
import OrderCard from '@/components/order/OrderCard.vue';
import HistoryCard from '@/components/order/HistoryCard.vue';
import type { Orders } from '@/types';
import { useOrder } from '@/composables/useOrder';
import { useCartStore, useHomeStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

const showActive = ref(true);
const { headerHeight } = useHeaderHeight();

const {
   activeOrders,
   historyOrders,
   hasMoreHistory,
   historyLoading,
   loading,
   fetchOrders,
   toggleOrderType,
   loadMoreHistory,
} = useOrder();

const refreshing = ref(false);
const isFirstLoad = ref(true);

const onRefresh = async () => {
   refreshing.value = true;
   try {
      await fetchOrders(true);
   } finally {
      refreshing.value = false;
   }
};

const cartStore = useCartStore();
const homeStore = useHomeStore();

const handleToggleChange = (active: boolean) => {
   showActive.value = active;
   toggleOrderType(active);
};

const handleOrderClick = (order: Orders) => {
   uni.navigateTo({
      url: `/pages/order/detail?id=${order.order_id}`,
   });
};

const handleScrollBottom = () => {
   if (!showActive.value && hasMoreHistory.value && !historyLoading.value) {
      loadMoreHistory();
   }
};

const handleReorder = async (order: Orders) => {
   const details = order.order_details;
   if (!details || details.length === 0) {
      uni.showToast({ title: '订单无商品信息', icon: 'none' });
      return;
   }

   // 按需加载商品数据（store 为空时才请求）
   if (homeStore.products.length === 0) {
      await homeStore.fetchData();
   }

   let addedCount = 0;
   for (const item of details) {
      const product = homeStore.getProductById(item.product_id);
      if (product) {
         cartStore.addItem(product, { ...item.specs });
         addedCount++;
      }
   }

   if (addedCount > 0) {
      uni.showToast({ title: '已加入购物车', icon: 'success' });
      uni.switchTab({ url: '/pages/cart/index' });
   } else {
      uni.showToast({ title: '商品已下架', icon: 'none' });
   }
};

onShow(async () => {
   if (isFirstLoad.value) {
      isFirstLoad.value = false;
      await fetchOrders();
   } else {
      await fetchOrders(true);
   }
});
</script>

<template>
   <view
      class="order-page"
      :style="
         headerHeight > 0
            ? {
                 paddingTop: headerHeight + 'px',
                 '--header-height': headerHeight + 'px',
              }
            : {}
      "
   >
      <Header title="订单中心" :show-back="true" />

      <view class="page-content">
         <view class="toggle-wrapper">
            <OrderToggle :active="showActive" @change="handleToggleChange" />
         </view>

         <scroll-view
            class="order-list"
            scroll-y
            scroll-with-animation
            refresher-enabled
            :refresher-triggered="refreshing"
            @refresherrefresh="onRefresh"
            @scrolltolower="handleScrollBottom"
         >
            <view v-if="showActive" class="order-section">
               <view class="section-header">
                  <text class="section-title">进行中的订单</text>
                  <view class="section-count-pill" v-if="activeOrders.length > 0">
                     <text class="section-count">{{ activeOrders.length }}个进行中</text>
                  </view>
               </view>

               <view v-if="loading" class="loading-hint">
                  <text class="empty-text">加载中...</text>
               </view>

               <view v-else-if="activeOrders.length === 0" class="empty-hint">
                  <text class="empty-text">暂无进行中的订单</text>
               </view>

               <OrderCard
                  v-for="order in activeOrders"
                  :key="order._id"
                  :order="order"
                  @click="handleOrderClick"
               />
            </view>

            <view v-else class="order-section">
               <view class="section-header">
                  <text class="section-title">历史记录</text>
               </view>

               <view v-if="loading" class="loading-hint">
                  <text class="empty-text">加载中...</text>
               </view>

               <HistoryCard
                  v-for="order in historyOrders"
                  :key="order._id"
                  :order="order"
                  @click="handleOrderClick"
                  @reorder="handleReorder"
               />

               <view v-if="!loading && historyOrders.length === 0" class="no-more">
                  <text class="no-more-text">暂无历史订单</text>
               </view>

               <view v-else-if="hasMoreHistory" class="load-more-wrap" @click="handleScrollBottom">
                  <view v-if="historyLoading" class="load-more-spinner" />
                  <text class="load-more-label">{{
                     historyLoading ? '正在加载' : '查看更多订单'
                  }}</text>
                  <view v-if="!historyLoading" class="load-more-arrow" />
               </view>

               <view v-else class="no-more-end">
                  <view class="no-more-line" />
                  <text class="no-more-text">已展示全部订单</text>
                  <view class="no-more-line" />
               </view>
            </view>

            <view class="bottom-spacer"></view>
         </scroll-view>
      </view>

      <TabBar :current="1" />
   </view>
</template>

<style lang="scss" scoped>
.order-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-top: var(--header-height, 176rpx);
   padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
   box-sizing: border-box;
}

.page-content {
   height: 100%;
   padding: 0 24rpx;
   padding-top: 24rpx;
}

.toggle-wrapper {
   margin-bottom: 32rpx;
}

.order-list {
   height: calc(100vh - var(--header-height, 176rpx) - 128rpx - 120rpx);
}

.order-section {
   margin-bottom: 48rpx;
}

.section-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 24rpx;
}

.section-title {
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 44rpx;
}

.section-count-pill {
   background-color: rgba(238, 134, 43, 0.1);
   padding: 4rpx 16rpx;
   border-radius: $radius-full;
}

.section-count {
   font-size: 24rpx;
   color: $brand-primary;
   line-height: 34rpx;
}

.empty-hint,
.loading-hint {
   padding: 48rpx 0;
   text-align: center;
}

.empty-text {
   font-size: 28rpx;
   color: $text-muted;
   line-height: 40rpx;
}

.no-more {
   padding: 32rpx 0;
   text-align: center;
}

.no-more-text {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
}

.load-more-wrap {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 12rpx;
   margin: 16rpx auto 0;
   padding: 20rpx 48rpx;
   border-radius: $radius-full;
   border: 2rpx solid $border-light;
   background-color: $bg-card;

   &:active {
      opacity: 0.6;
      transform: scale(0.97);
   }
}

.load-more-label {
   font-size: 26rpx;
   color: $text-secondary;
   font-weight: 500;
   line-height: 36rpx;
}

.load-more-arrow {
   width: 0;
   height: 0;
   border-left: 10rpx solid transparent;
   border-right: 10rpx solid transparent;
   border-top: 10rpx solid $text-muted;
}

.load-more-spinner {
   width: 28rpx;
   height: 28rpx;
   border: 3rpx solid $border-light;
   border-top-color: $brand-primary;
   border-radius: 50%;
   animation: spin 0.7s linear infinite;
}

.no-more-end {
   display: flex;
   align-items: center;
   gap: 20rpx;
   padding: 32rpx 0;
}

.no-more-line {
   flex: 1;
   height: 1rpx;
   background-color: $border-light;
}

.bottom-spacer {
   height: 32rpx;
}
</style>
