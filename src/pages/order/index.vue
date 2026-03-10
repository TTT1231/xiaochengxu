<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import OrderToggle from '@/components/order/OrderToggle.vue';
import OrderCard from '@/components/order/OrderCard.vue';
import HistoryCard from '@/components/order/HistoryCard.vue';
import { orders } from '@/mock';
import type { Order } from '@/types';

const showActive = ref(true);
const scrollTarget = ref('active-orders');

const handleToggleChange = (active: boolean) => {
   showActive.value = active;
   scrollTarget.value = active ? 'active-orders' : 'history-orders';
};

// 进行中的订单
const activeOrders = computed(() => orders.filter(order => order.status !== 'completed'));

// 历史订单
const historyOrders = computed(() => orders.filter(order => order.status === 'completed'));

const handleOrderClick = (order: Order) => {
   uni.navigateTo({
      url: `/pages/order/detail?id=${order.id}`,
   });
};

const handleReorder = (order: Order) => {
   uni.showToast({
      title: '已加入购物车',
      icon: 'success',
   });
};
</script>

<template>
   <view class="order-page">
      <Header title="订单中心" :show-back="true" />

      <view class="page-content">
         <view class="toggle-wrapper">
            <OrderToggle :active="showActive" @change="handleToggleChange" />
         </view>

         <scroll-view
            class="order-list"
            scroll-y
            :scroll-into-view="scrollTarget"
            scroll-with-animation
         >
            <!-- 进行中的订单 -->
            <view class="order-section" id="active-orders">
               <view class="section-header">
                  <text class="section-title">进行中的订单</text>
                  <view class="section-count-pill" v-if="activeOrders.length > 0">
                     <text class="section-count">{{ activeOrders.length }}个进行中</text>
                  </view>
               </view>

               <view v-if="activeOrders.length === 0" class="empty-hint">
                  <text class="empty-text">暂无进行中的订单</text>
               </view>

               <OrderCard
                  v-for="order in activeOrders"
                  :key="order.id"
                  :order="order"
                  @click="handleOrderClick"
               />
            </view>

            <!-- 历史记录 -->
            <view class="order-section" id="history-orders">
               <view class="section-header">
                  <text class="section-title">历史记录</text>
               </view>

               <HistoryCard
                  v-for="order in historyOrders"
                  :key="order.id"
                  :order="order"
                  @click="handleOrderClick"
                  @reorder="handleReorder"
               />

               <view class="no-more">
                  <text class="no-more-text">没有更多订单了</text>
               </view>
            </view>

            <!-- 底部占位，防止被 TabBar 遮挡 -->
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
   /* 使用 padding 为 Header 和 TabBar 留出空间 */
   padding-top: 176rpx; /* 状态栏(约44px) + Header内容(44px) ≈ 88px = 176rpx */
   padding-bottom: 128rpx; /* TabBar 高度 */
   box-sizing: border-box;
}

.page-content {
   height: 100%;
   padding: 0 24rpx;
   /* 额外的顶部间距，让内容不紧贴 Header */
   padding-top: 24rpx;
}

.toggle-wrapper {
   margin-bottom: 32rpx;
}

.order-list {
   height: calc(100vh - 176rpx - 128rpx - 120rpx); /* 添加 toggle 的高度减去 */
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

.empty-hint {
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
