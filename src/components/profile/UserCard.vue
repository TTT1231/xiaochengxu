<script setup lang="ts">
import type { Users } from '@/types';
import { computed } from 'vue';
import { useUserLevel } from '@/composables/useUserLevel';

const DEFAULT_AVATAR = '/static/images/avatar.png';

interface Props {
   user: Users;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.user.level));
</script>

<template>
   <view
      class="user-card"
      :class="[levelConfig.isVip ? `tier-${levelConfig.tier}` : '']"
      :style="{
         borderColor: levelConfig.color,
         boxShadow: levelConfig.shadow,
         ...(levelConfig.isVip ? { background: levelConfig.gradientBg } : {}),
      }"
   >
      <view
         class="avatar-wrap"
         :style="{
            borderColor: levelConfig.color,
            boxShadow: levelConfig.tier === 'gold' ? `0 0 20rpx ${levelConfig.lightBg}` : 'none',
         }"
      >
         <image :src="DEFAULT_AVATAR" class="avatar" mode="aspectFill" />
      </view>
      <view class="user-info">
         <text class="nickname">{{ user.name }}</text>
         <view
            v-if="levelConfig.isVip"
            class="member-badge"
            :style="{
               background: levelConfig.badgeGradient,
            }"
         >
            <text class="member-text">{{ levelConfig.displayLabel }}</text>
         </view>
         <text class="user-id">ID: {{ user.id }}</text>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.user-card {
   padding: 32rpx;
   display: flex;
   align-items: center;
   border-radius: 28rpx;
   border: 2rpx solid transparent;
   background-color: $bg-card;
   transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
}

.avatar-wrap {
   width: 152rpx;
   height: 152rpx;
   border-radius: $radius-full;
   border: 3rpx solid transparent;
   margin-right: 28rpx;
   flex-shrink: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
}

.avatar {
   width: 140rpx;
   height: 140rpx;
   border-radius: $radius-full;
   background-color: #6bb2aa;
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
   color: $text-primary;
   line-height: 52rpx;
}

.member-badge {
   align-self: flex-start;
   border-radius: $radius-full;
   padding: 6rpx 20rpx;
}

.member-text {
   font-size: 22rpx;
   font-weight: 600;
   color: #ffffff;
   line-height: 30rpx;
   text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

.user-id {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
   margin-top: 4rpx;
}
</style>
