<script setup lang="ts">
import { currentUser } from '@/mock';
import { commonIcons } from '@/data/imgPaths';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import UserCard from '@/components/profile/UserCard.vue';
import StatsCard from '@/components/profile/StatsCard.vue';
import MenuList from '@/components/profile/MenuList.vue';

const serviceIconSrc = commonIcons.customerService;

const handlePointsClick = () => {
   uni.navigateTo({ url: '/pages/points/index' });
};

const handleCouponsClick = () => {
   // TODO: Navigate to coupons page
};

const handleMenuClick = (key: string) => {
   // TODO: Implement menu navigation
};

const handleServiceClick = () => {
   uni.showToast({
      title: '正在连接客服...',
      icon: 'loading',
   });
};

const handleLogout = () => {
   uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
         if (res.confirm) {
            uni.showToast({
               title: '已退出登录',
               icon: 'success',
            });
         }
      },
   });
};
</script>

<template>
   <view class="profile-page">
      <Header title="个人中心" :show-back="false" />

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

         <!-- 联系客服按钮 -->
         <view class="card-spacing">
            <view class="service-btn" @click="handleServiceClick">
               <image class="service-icon" :src="serviceIconSrc" mode="aspectFit" />
               <view class="service-text">
                  <text class="service-title">联系客服</text>
                  <text class="service-subtitle">解答您的任何疑问</text>
               </view>
               <text class="service-arrow">›</text>
            </view>
         </view>

         <!-- 退出登录 -->
         <view class="logout-wrapper">
            <text class="logout-text" @click="handleLogout">退出登录</text>
         </view>

         <!-- 底部占位 -->
         <view class="bottom-spacer"></view>
      </view>

      <TabBar :current="2" />
   </view>
</template>

<style lang="scss" scoped>
.profile-page {
   min-height: 100vh;
   background-color: $bg-page;
   /* 为 Header 留出空间 */
   padding-top: 176rpx;
   box-sizing: border-box;
}

.content {
   padding: 0 24rpx;
}

.card-spacing {
   margin-bottom: 24rpx;
}

// 联系客服按钮
.service-btn {
   background: linear-gradient(to right, #ee862b, #f59e0b);
   border-radius: $radius-lg;
   padding: 32rpx;
   display: flex;
   align-items: center;
   gap: 20rpx;
   box-shadow: $shadow-card;
}

.service-icon {
   width: 48rpx;
   height: 48rpx;
   flex-shrink: 0;
}

.service-text {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 4rpx;
}

.service-title {
   font-size: 32rpx;
   font-weight: 500;
   color: #ffffff;
   line-height: 44rpx;
}

.service-subtitle {
   font-size: 24rpx;
   color: rgba(255, 255, 255, 0.8);
   line-height: 34rpx;
}

.service-arrow {
   font-size: 40rpx;
   color: rgba(255, 255, 255, 0.8);
   font-weight: 300;
}

// 退出登录
.logout-wrapper {
   display: flex;
   justify-content: center;
   align-items: center;
   padding: 32rpx 0;
   margin-bottom: 24rpx;
   background-color: $bg-card;
   border-radius: $radius-lg;
   border: 2rpx solid $border-light;
   box-shadow: $shadow-card;
}

.logout-text {
   font-size: 28rpx;
   color: #94a3b8; /* text-muted matching 4.png */
   line-height: 40rpx;
}

// 底部占位 - 防止被 TabBar 遮挡
.bottom-spacer {
   height: 128rpx;
}
</style>
