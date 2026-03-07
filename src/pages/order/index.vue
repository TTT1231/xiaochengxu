<template>
   <view class="order-page">
      <Header title="订单" :show-back="false" />

      <view class="page-content" :style="{ paddingTop: headerHeight + 'px' }">
         <view class="toggle-wrapper">
            <OrderToggle :active="isShowActive" @change="handleToggleChange" />
         </view>

         <scroll-view class="order-list" scroll-y enable-flex>
            <view v-if="displayOrders.length === 0" class="empty-state">
               <image
                  class="empty-icon"
                  src="/static/images/empty-order.png"
                  mode="aspectFit"
               />
               <text class="empty-text">{{
                  isShowActive ? '暂无进行中的订单' : '暂无历史订单'
               }}</text>
            </view>

            <template v-else>
               <OrderCard
                  v-for="order in displayOrders"
                  v-if="isShowActive"
                  :key="order.id"
                  :order="order"
                  @click="handleOrderClick"
               />
               <HistoryCard
                  v-for="order in displayOrders"
                  v-else
                  :key="order.id"
                  :order="order"
                  @click="handleOrderClick"
               />
            </template>
         </scroll-view>
      </view>

      <TabBar :current="1" />
   </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onReady } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import OrderToggle from '@/components/order/OrderToggle.vue';
import OrderCard from '@/components/order/OrderCard.vue';
import HistoryCard from '@/components/order/HistoryCard.vue';
import { useOrder } from '@/composables/useOrder';
import type { Order } from '@/types';

const {
   displayOrders,
   isShowActive,
   getStatusText,
   toggleOrderType,
   initOrders,
} = useOrder();

const headerHeight = ref(0);

onMounted(() => {
   initOrders();
});

onReady(() => {
   const systemInfo = uni.getSystemInfoSync();
   const statusBarHeight = systemInfo.statusBarHeight || 0;
   headerHeight.value = statusBarHeight + 88;
});

const handleToggleChange = (value: boolean) => {
   toggleOrderType(value);
};

const handleOrderClick = (order: Order) => {
   uni.navigateTo({
      url: `/pages/order/detail?id=${order.id}`,
   });
};
</script>

<style lang="scss" scoped>
.order-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-bottom: 100rpx;
}

.page-content {
   padding: 24rpx;
}

.toggle-wrapper {
   display: flex;
   justify-content: center;
   margin-bottom: 32rpx;
}

.order-list {
   height: calc(100vh - 280rpx);
}

.empty-state {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding-top: 120rpx;
}

.empty-icon {
   width: 240rpx;
   height: 240rpx;
   margin-bottom: 24rpx;
   opacity: 0.4;
}

.empty-text {
   font-size: 28rpx;
   color: $text-muted;
   line-height: 40rpx;
}
</style>
