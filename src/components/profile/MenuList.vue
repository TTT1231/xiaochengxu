<script setup lang="ts">
import { computed } from 'vue';
import { useUserLevel } from '@/composables/useUserLevel';

const MENU_ICONS = '/static/icons/menu';

interface MenuItem {
   key: string;
   icon: string;
   label: string;
}

interface Props {
   isVip: boolean;
}

const props = defineProps<Props>();

const levelConfig = computed(() => useUserLevel(props.isVip));

const menuItems: MenuItem[] = [
   {
      key: 'vip',
      icon: `${MENU_ICONS}/menu-coupons.svg`,
      label: '会员卡兑换',
   },
   {
      key: 'privacy',
      icon: `${MENU_ICONS}/menu-privacy.svg`,
      label: '隐私政策',
   },
   {
      key: 'agreement',
      icon: `${MENU_ICONS}/menu-agreement.svg`,
      label: '用户协议',
   },
   {
      key: 'business',
      icon: `${MENU_ICONS}/menu-business.svg`,
      label: '经营公示',
   },
];

const emit = defineEmits<{
   (e: 'click', key: string): void;
}>();
</script>

<template>
   <view class="menu-list" :style="{ boxShadow: `0 2rpx 16rpx ${levelConfig.lightBg}` }">
      <view
         v-for="(item, index) in menuItems"
         :key="item.key"
         class="menu-item"
         :class="{ 'has-divider': index < menuItems.length - 1 }"
         @click="emit('click', item.key)"
      >
         <view
            class="menu-icon"
            :style="levelConfig.lightBg ? { backgroundColor: levelConfig.lightBg } : {}"
         >
            <image :src="item.icon" class="icon" />
         </view>
         <text class="menu-label">{{ item.label }}</text>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.menu-list {
   background-color: $bg-card;
   border-radius: $radius-lg;
   overflow: hidden;
}

.menu-item {
   display: flex;
   align-items: center;
   padding: 28rpx 32rpx;
   position: relative;

   &.has-divider::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 100rpx;
      right: 0;
      height: 1rpx;
      background-color: $border-light;
      transform: scaleY(0.5);
   }

   &:active {
      background-color: $bg-hover;
   }
}

.menu-icon {
   width: 56rpx;
   height: 56rpx;
   margin-right: 24rpx;
   background-color: rgba(238, 134, 43, 0.1);
   border-radius: 12rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: background-color 0.2s ease;

   .icon {
      width: 32rpx;
      height: 32rpx;
   }
}

.menu-label {
   flex: 1;
   font-size: 28rpx;
   color: $text-primary;
   line-height: 40rpx;
}
</style>
