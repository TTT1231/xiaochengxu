<script setup lang="ts">
interface Props {
   categories: string[];
   active: string;
}

defineProps<Props>();

const emit = defineEmits<{
   change: [category: string];
}>();
</script>

<template>
   <scroll-view class="category-tabs" scroll-x :show-scrollbar="false">
      <view class="tabs-container">
         <view
            v-for="category in categories"
            :key="category"
            class="tab-item"
            :class="{ active: category === active }"
            @click="emit('change', category)"
         >
            <text class="tab-text">{{ category }}</text>
         </view>
      </view>
   </scroll-view>
</template>

<style lang="scss" scoped>
.category-tabs {
   height: 64rpx;
   white-space: nowrap;
}

.tabs-container {
   display: inline-flex;
   gap: 16rpx;
   padding: 0 24rpx;
}

.tab-item {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   padding: 12rpx 24rpx;
   background-color: $bg-input;
   border-radius: $radius-full;
   transition: all 0.3s;

   &.active {
      background-color: $brand-primary;
   }
}

.tab-text {
   font-size: 26rpx;
   color: $text-secondary;
   white-space: nowrap;

   .active & {
      color: #ffffff;
      font-weight: 500;
   }
}
</style>
