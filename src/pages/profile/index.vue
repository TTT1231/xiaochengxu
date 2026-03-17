<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { commonIcons } from '@/data/imgPaths';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { useUserLevel } from '@/composables/useUserLevel';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import UserCard from '@/components/profile/UserCard.vue';
import StatsCard from '@/components/profile/StatsCard.vue';
import MenuList from '@/components/profile/MenuList.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();
const serviceIconSrc = commonIcons.customerService;

const userProfile = computed(() => userStore.user);
const credits = computed(() => userStore.credits);

const levelConfig = computed(() => useUserLevel(userProfile.value?.level ?? '普通用户'));

onShow(() => {
   userStore.fetchProfile();
});

const handlePointsClick = () => {
   uni.navigateTo({ url: '/pages/points/index' });
};

const handleCouponsClick = () => {
   // TODO: Navigate to coupons page
};

const handleMenuClick = (_key: string) => {
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
            userStore.logout();
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
   <view
      class="profile-page"
      :style="{
         paddingTop: headerHeight + 'px',
         backgroundColor: levelConfig.pageBg,
      }"
   >
      <Header title="个人中心" :show-back="false" />

      <!-- VIP 顶部标识线 -->
      <view
         v-if="levelConfig.isVip"
         class="tier-accent"
         :style="{ background: `linear-gradient(to right, ${levelConfig.color}, transparent)` }"
      ></view>

      <!-- 顶部氛围带 -->
      <view
         class="tier-banner"
         :style="{
            background: levelConfig.bannerGradient,
         }"
      >
         <view
            v-if="levelConfig.isVip"
            class="banner-glow"
            :style="{ backgroundColor: levelConfig.color }"
         ></view>
         <view
            v-if="levelConfig.isVip"
            class="banner-glow banner-glow--secondary"
            :style="{ backgroundColor: levelConfig.color }"
         ></view>
         <view class="banner-content">
            <view v-if="userProfile" class="user-card-wrap">
               <UserCard :user="userProfile" />
            </view>
            <view v-else class="user-card-wrap">
               <UserCard
                  :user="{
                     openid: '',
                     name: '加载中...',
                     id: '--',
                     level: '普通用户',
                     created_at: '',
                     user_id: '',
                  }"
               />
            </view>
         </view>
      </view>

      <!-- 下方内容区 -->
      <view class="content">
         <view class="card-spacing">
            <StatsCard
               :points="credits?.available_scores ?? 0"
               :coupons="0"
               :level="userProfile?.level"
               @click:points="handlePointsClick"
               @click:coupons="handleCouponsClick"
            />
         </view>

         <view class="card-spacing">
            <MenuList :level="userProfile?.level" @click="handleMenuClick" />
         </view>

         <view class="card-spacing">
            <view
               class="service-btn"
               :style="{ background: levelConfig.serviceGradient }"
               @click="handleServiceClick"
            >
               <image class="service-icon" :src="serviceIconSrc" mode="aspectFit" />
               <view class="service-text">
                  <text class="service-title">联系客服</text>
                  <text class="service-subtitle">解答您的任何疑问</text>
               </view>
               <text class="service-arrow">›</text>
            </view>
         </view>

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
   box-sizing: border-box;
   transition: background-color 0.3s ease;
}

/* ── 顶部氛围带 ── */
.tier-banner {
   position: relative;
   overflow: hidden;
}

.banner-content {
   padding: 24rpx 24rpx 32rpx;
}

.banner-glow {
   position: absolute;
   top: 20rpx;
   right: 20rpx;
   width: 200rpx;
   height: 200rpx;
   border-radius: 50%;
   opacity: 0.15;

   &--secondary {
      top: auto;
      right: auto;
      bottom: -30rpx;
      left: -30rpx;
      width: 160rpx;
      height: 160rpx;
      opacity: 0.08;
   }
}

.tier-accent {
   height: 6rpx;
}

.user-card-wrap {
   position: relative;
   z-index: 1;
}

/* ── 下方内容区 ── */
.content {
   padding: 0 24rpx;
}

.card-spacing {
   margin-bottom: 24rpx;
}

/* ── 联系客服按钮 ── */
.service-btn {
   border-radius: $radius-lg;
   padding: 32rpx;
   display: flex;
   align-items: center;
   gap: 20rpx;
   box-shadow: $shadow-card;
   transition: background 0.3s ease;
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
   color: $uni-text-color-inverse;
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

/* ── 退出登录 ── */
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
   color: $text-muted;
   line-height: 40rpx;
}

.bottom-spacer {
   height: 128rpx;
}
</style>
