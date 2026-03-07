<template>
   <view class="user-card">
      <view class="avatar-wrapper">
         <image :src="user.avatar" class="avatar" mode="aspectFill" />
      </view>
      <view class="user-info">
         <text class="nickname">{{ user.nickname }}</text>
         <view class="member-badge">
            <text class="member-text">{{ user.memberLevel }}</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import type { User } from '@/types';

interface Props {
   user: User;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.user-card {
   background: linear-gradient(
      135deg,
      $brand-primary 0%,
      $brand-primary-dark 100%
   );
   border-radius: $radius-lg;
   padding: 40rpx 32rpx;
   display: flex;
   align-items: center;
}

.avatar-wrapper {
   margin-right: 24rpx;

   .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-full;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background-color: $bg-card;
   }
}

.user-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 12rpx;

   .nickname {
      font-size: 36rpx;
      font-weight: 600;
      color: #ffffff;
      line-height: 50rpx;
   }

   .member-badge {
      align-self: flex-start;
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10rpx);
      border-radius: $radius-full;
      padding: 8rpx 20rpx;

      .member-text {
         font-size: 22rpx;
         color: #ffffff;
         line-height: 30rpx;
      }
   }
}
</style>
