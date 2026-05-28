<script setup lang="ts">
import type { Users } from '@/types';
import { computed } from 'vue';
import { useUserLevel } from '@/composables/useUserLevel';

const DEFAULT_AVATAR = '/static/images/avatar.png';

interface Props {
   user: Users;
}

const props = defineProps<Props>();
const emit = defineEmits<{
   (e: 'click'): void;
}>();

const levelConfig = computed(() => useUserLevel(props.user.level));
</script>

<template>
   <view
      class="user-card"
      :class="[`tier-${levelConfig.tier}`]"
      :style="{
         borderColor: levelConfig.color,
         boxShadow: levelConfig.shadow,
         background: levelConfig.gradientBg,
      }"
      @click="emit('click')"
   >
      <view
         class="avatar-wrap"
         :style="{
            borderColor: levelConfig.color,
            boxShadow: levelConfig.tier === 'vip' ? `0 0 20rpx ${levelConfig.lightBg}` : 'none',
         }"
      >
         <image :src="DEFAULT_AVATAR" class="avatar" mode="aspectFill" />
      </view>
      <view class="user-info">
         <text class="nickname">{{ user.name }}</text>
         <view
            class="member-badge"
            :class="[levelConfig.isVip ? 'member-badge--vip' : 'member-badge--normal']"
            :style="{
               background: levelConfig.badgeGradient,
            }"
         >
            <text class="member-text" :style="{ color: levelConfig.badgeTextColor }">{{
               levelConfig.displayLabel
            }}</text>
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

.tier-vip {
   border: 2rpx solid rgba(161, 98, 7, 0.2);
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

   &--normal {
      border: 1rpx solid rgba(232, 135, 58, 0.15);
   }

   &--vip {
      border: none;
   }
}

.member-text {
   font-size: 22rpx;
   font-weight: 600;
   line-height: 30rpx;

   .member-badge--vip & {
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
   }
}

.user-id {
   font-size: 24rpx;
   color: $text-muted;
   line-height: 34rpx;
   margin-top: 4rpx;
}
</style>
