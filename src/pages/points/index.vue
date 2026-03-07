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
   // TODO: Navigate to reward detail page
};
</script>

<style lang="scss" scoped>
.points-page {
   min-height: 100vh;
   background-color: $bg-page;
}

.page-content {
   padding-top: calc(var(--status-bar-height) + 88rpx);
   padding-bottom: 32rpx;
}

.category-section {
   margin: 24rpx 24rpx 20rpx;
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
</style>
