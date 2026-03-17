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

const { activeOrders, historyOrders, loading, fetchOrders, toggleOrderType } = useOrder();

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

const handleReorder = (order: Orders) => {
   const details = order.oder_details;
   if (!details || details.length === 0) {
      uni.showToast({ title: '订单无商品信息', icon: 'none' });
      return;
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
   await homeStore.fetchData();
   await fetchOrders();
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

         <scroll-view class="order-list" scroll-y scroll-with-animation>
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

               <view v-else-if="!loading" class="no-more">
                  <text class="no-more-text">没有更多订单了</text>
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
   padding-bottom: 128rpx;
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

.bottom-spacer {
   height: 32rpx;
}
</style>
