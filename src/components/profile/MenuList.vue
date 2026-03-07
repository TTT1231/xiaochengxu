<template>
   <view class="menu-list">
      <view
         v-for="(item, index) in menuItems"
         :key="item.key"
         class="menu-item"
         :class="{ 'has-divider': index < menuItems.length - 1 }"
         @click="handleMenuClick(item.key)"
      >
         <view class="menu-icon">
            <image :src="item.icon" class="icon" />
         </view>
         <text class="menu-label">{{ item.label }}</text>
         <view class="menu-arrow">
            <text class="arrow">›</text>
         </view>
      </view>
   </view>
</template>

<script setup lang="ts">
import { menuIcons } from '@/data/imgPaths';

interface MenuItem {
   key: string;
   icon: string;
   label: string;
}

const emit = defineEmits<{
   (e: 'click', key: string): void;
}>();

const menuItems: MenuItem[] = menuIcons;

const handleMenuClick = (key: string) => {
   emit('click', key);
};
</script>

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
   cursor: pointer;

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
   width: 40rpx;
   height: 40rpx;
   margin-right: 20rpx;

   .icon {
      width: 100%;
      height: 100%;
   }
}

.menu-label {
   flex: 1;
   font-size: 28rpx;
   color: $text-primary;
   line-height: 40rpx;
}

.menu-arrow {
   .arrow {
      font-size: 36rpx;
      color: $text-muted;
      font-weight: 300;
   }
}
</style>
