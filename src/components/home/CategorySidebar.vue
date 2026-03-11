<script setup lang="ts">
import type { Categoried } from '@/types';

interface Props {
   categories: Categoried[];
   activeId: number;
}

defineProps<Props>();

interface Emits {
   (e: 'select', id: number): void;
}

const emit = defineEmits<Emits>();

const handleSelect = (id: number): void => {
   emit('select', id);
};
</script>

<template>
   <scroll-view class="category-sidebar" scroll-y>
      <view
         v-for="category in categories"
         :key="category._id"
         class="category-item"
         :class="{ active: category._id === activeId }"
         @click="handleSelect(category._id)"
      >
         <image
            class="category-icon"
            :src="category._id === activeId ? category.active_icon || category.icon : category.icon"
            mode="aspectFit"
         />
         <text class="category-name">{{ category.name }}</text>
      </view>
   </scroll-view>
</template>

<style lang="scss" scoped>
.category-sidebar {
   width: 192rpx;
   height: 100%;
   background-color: #f8fafc;
}

.category-item {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 40rpx 8rpx;
   border-left: 8rpx solid transparent;
   transition: all 0.2s;
   background-color: transparent;

   &.active {
      background-color: $bg-card;
      border-left-color: $brand-primary;
      border-left-style: solid;

      .category-name {
         color: $brand-primary;
      }
   }
}

.category-icon {
   width: 33rpx;
   height: 40rpx;
   margin-bottom: 8rpx;
}

.category-name {
   font-size: 24rpx;
   font-weight: 500;
   color: $text-tertiary;
   white-space: nowrap;
   text-align: center;
   line-height: 32rpx;
}
</style>
