<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { useUserLevel } from '@/composables/useUserLevel';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import UserCard from '@/components/profile/UserCard.vue';
import StatsCard from '@/components/profile/StatsCard.vue';
import MenuList from '@/components/profile/MenuList.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();
const userProfile = computed(() => userStore.user);
const credits = computed(() => userStore.credits);

const levelConfig = computed(() => useUserLevel(userProfile.value?.level ?? '普通会员'));

onShow(() => {
   userStore.fetchProfile();
});

function handlePointsClick(): void {
   uni.navigateTo({ url: '/pages/points/index' });
}

function handleCouponsClick(): void {
   // TODO: Navigate to coupons page
}

function handleMenuClick(_key: string): void {
   // TODO: Implement menu navigation
}

function handleLogout(): void {
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
}
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

      <view
         v-if="levelConfig.isVip"
         class="tier-accent"
         :style="{ background: `linear-gradient(to right, ${levelConfig.color}, transparent)` }"
      ></view>

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
                     level: '普通会员',
                     created_at: '',
                     user_id: '',
                  }"
               />
            </view>
         </view>
      </view>

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
            <MenuList :level="userProfile?.level" @click="handleMenuClick" @logout="handleLogout" />
         </view>

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

.content {
   padding: 0 24rpx;
}

.card-spacing {
   margin-bottom: 24rpx;
}

.bottom-spacer {
   height: 128rpx;
}
</style>
