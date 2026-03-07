<template>
   <view class="profile-page">
      <Header title="我的" :show-back="false" />
      <view class="content">
         <view class="card-spacing">
            <UserCard :user="currentUser" />
         </view>
         <view class="card-spacing">
            <StatsCard
               :points="currentUser.points"
               :coupons="currentUser.coupons"
               @click:points="handlePointsClick"
               @click:coupons="handleCouponsClick"
            />
         </view>
         <view class="card-spacing">
            <MenuList @click="handleMenuClick" />
         </view>
      </view>
      <TabBar :current="2" />
   </view>
</template>

<script setup lang="ts">
import { currentUser } from '@/mock';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import UserCard from '@/components/profile/UserCard.vue';
import StatsCard from '@/components/profile/StatsCard.vue';
import MenuList from '@/components/profile/MenuList.vue';

const handlePointsClick = () => {
   uni.navigateTo({ url: '/pages/points/index' });
};

const handleCouponsClick = () => {
   // TODO: Navigate to coupons page when implemented
   console.log('Navigate to coupons');
};

const handleMenuClick = (key: string) => {
   switch (key) {
      case 'points':
         uni.navigateTo({ url: '/pages/points/index' });
         break;
      case 'coupons':
         console.log('Navigate to coupons');
         break;
      case 'address':
         console.log('Navigate to address');
         break;
      case 'settings':
         console.log('Navigate to settings');
         break;
      case 'about':
         console.log('Navigate to about');
         break;
   }
};
</script>

<style lang="scss" scoped>
.profile-page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-bottom: 100rpx;
}

.content {
   padding: 120rpx 24rpx 0;
}

.card-spacing {
   margin-bottom: 24rpx;
}
</style>
