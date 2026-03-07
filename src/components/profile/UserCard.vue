<template>
   <view class="user-card">
      <image :src="user.avatar" class="avatar" mode="aspectFill" />
      <view class="user-info">
         <text class="nickname">{{ user.nickname }}</text>
         <view class="member-badge">
            <text class="member-text">{{ user.memberLevel }}</text>
         </view>
         <text class="user-id">ID: {{ user.id }}</text>
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
   background-color: transparent;
   padding: 20rpx 0 40rpx 0;
   display: flex;
   align-items: center;
}

.avatar {
   width: 140rpx;
   height: 140rpx;
   border-radius: $radius-full;
   background-color: #6bb2aa;
   margin-right: 32rpx;
   flex-shrink: 0;
}

.user-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 12rpx;
}

.nickname {
   font-size: 38rpx;
   font-weight: 600;
   color: #1e293b;
   line-height: 52rpx;
}

.member-badge {
   align-self: flex-start;
   background-color: rgba($brand-primary, 0.1);
   border-radius: $radius-full;
   padding: 4rpx 16rpx;
}

.member-text {
   font-size: 22rpx;
   color: $brand-primary;
   font-weight: 500;
   line-height: 30rpx;
}

.user-id {
   font-size: 24rpx;
   color: #94a3b8;
   line-height: 34rpx;
   margin-top: 4rpx;
}
</style>
