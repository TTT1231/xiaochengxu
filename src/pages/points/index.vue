<script setup lang="ts">
import { ref } from 'vue';
import type { Reward } from '@/types';
import Header from '@/components/common/Header.vue';
import PointsCard from '@/components/points/PointsCard.vue';
import RewardCard from '@/components/points/RewardCard.vue';
import { currentUser, hotRewards } from '@/mock';

const rewards = ref<Reward[]>(hotRewards);

const handleDetailClick = () => {
   // TODO: Navigate to points detail page
};

const handleExchange = (reward: Reward) => {
   // TODO: Implement reward redemption
   console.log('Exchange reward:', reward);
};

const handleViewMore = () => {
   // TODO: Navigate to all rewards page
};
</script>

<template>
   <view class="points-page">
      <Header title="积分商城" :show-back="true" />

      <view class="page-content">
         <!-- 积分卡片 -->
         <PointsCard :points="currentUser.points" @detail="handleDetailClick" />

         <!-- 热门兑换标题 -->
         <view class="section-header">
            <text class="section-title">热门兑换</text>
            <text class="view-more" @click="handleViewMore">查看更多</text>
         </view>

         <!-- 商品网格 -->
         <scroll-view class="rewards-scroll" scroll-y>
            <view class="rewards-grid">
               <view
                  v-for="reward in rewards"
                  :key="reward.id"
                  class="reward-item"
               >
                  <RewardCard :reward="reward" @exchange="handleExchange" />
               </view>
            </view>

            <!-- 底部占位 -->
            <view class="bottom-spacer"></view>
         </scroll-view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.points-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-top: 176rpx;
   box-sizing: border-box;
}

.page-content {
   height: calc(100vh - 176rpx);
   display: flex;
   flex-direction: column;
   padding-top: 32rpx;
}

.section-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin: 32rpx 32rpx 24rpx;
}

.section-title {
   font-size: 36rpx;
   font-weight: 600;
   color: $text-primary;
   line-height: 46rpx;
}

.view-more {
   font-size: 24rpx;
   color: $brand-primary;
   line-height: 32rpx;
}

.rewards-scroll {
   flex: 1;
   height: calc(100vh - 176rpx - 340rpx);
}

.rewards-grid {
   display: flex;
   flex-wrap: wrap;
   padding: 0 32rpx;
   /* 使用 gap 控制间距，兼容不同设备 */
   gap: 24rpx;
}

.reward-item {
   /* 两列布局，考虑间距 */
   width: calc((100% - 24rpx) / 2);
   /* 限制最大宽度，防止在大屏设备上过宽 */
   max-width: 400rpx;
   flex-shrink: 0;
}

.bottom-spacer {
   height: 48rpx;
}
</style>
