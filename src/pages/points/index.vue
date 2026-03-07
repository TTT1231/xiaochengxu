<template>
   <view class="points-page">
      <Header title="积分商城" :show-back="true" />

      <view class="page-content">
         <PointsCard :points="currentUser.points" />

         <view class="category-section">
            <CategoryTabs
               :categories="rewardCategories"
               :active="activeCategory"
               @change="handleCategoryChange"
            />
         </view>

         <scroll-view class="rewards-scroll" scroll-y>
            <view class="rewards-list">
               <view
                  v-for="reward in filteredRewards"
                  :key="reward.id"
                  class="reward-item"
               >
                  <RewardCard
                     :reward="reward"
                     @click="handleRewardClick(reward)"
                  />
               </view>
            </view>

            <view v-if="filteredRewards.length === 0" class="empty-state">
               <text class="empty-text">暂无该分类商品</text>
            </view>

            <!-- 底部占位 -->
            <view class="bottom-spacer"></view>
         </scroll-view>
      </view>
   </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '@/components/common/Header.vue';
import PointsCard from '@/components/points/PointsCard.vue';
import CategoryTabs from '@/components/points/CategoryTabs.vue';
import RewardCard from '@/components/points/RewardCard.vue';
import { currentUser, rewardCategories, getRewardsByCategory } from '@/mock';

const activeCategory = ref('全部');

const filteredRewards = computed(() => {
   return getRewardsByCategory(activeCategory.value);
});

const handleCategoryChange = (category: string) => {
   activeCategory.value = category;
};

const handleRewardClick = (reward: any) => {
   console.log('Clicked reward:', reward);
};
</script>

<style lang="scss" scoped>
.points-page {
   min-height: 100vh;
   background-color: $bg-page;
   /* 为 Header 留出空间 */
   padding-top: 176rpx;
   box-sizing: border-box;
}

.page-content {
   height: calc(100vh - 176rpx);
   display: flex;
   flex-direction: column;
   /* 额外的顶部间距 */
   padding-top: 24rpx;
}

.category-section {
   margin: 24rpx 24rpx 20rpx;
   flex-shrink: 0;
}

.rewards-scroll {
   flex: 1;
   height: calc(100vh - 176rpx - 200rpx); /* 减去 Header 和 PointsCard+分类的高度 */
}

.rewards-list {
   display: flex;
   flex-direction: column;
   gap: 16rpx;
   padding: 0 24rpx;
}

.reward-item {
   width: 100%;
}

.empty-state {
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 80rpx 0;
}

.empty-text {
   font-size: 28rpx;
   color: $text-muted;
}

.bottom-spacer {
   height: 48rpx;
}
</style>
