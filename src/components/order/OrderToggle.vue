<script setup lang="ts">
interface Props {
   active: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
   change: [value: boolean];
}>();

const handleToggle = (value: boolean) => {
   if (value !== props.active) {
      emit('change', value);
   }
};
</script>

<template>
   <view class="order-toggle">
      <view class="toggle-btn" :class="{ active: active }" @click="handleToggle(true)">
         <text class="btn-text">当前订单</text>
      </view>
      <view class="toggle-btn" :class="{ active: !active }" @click="handleToggle(false)">
         <text class="btn-text">历史订单</text>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.order-toggle {
   display: flex;
   width: 100%;
   height: 88rpx;
   background-color: #fcece3;
   border-radius: $radius-full;
   padding: 8rpx;
   box-sizing: border-box;
}

.toggle-btn {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: $radius-full;
   transition: all 0.3s;

   &.active {
      background-color: #ffffff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
   }
}

.btn-text {
   font-size: 30rpx;
   font-weight: 500;

   .toggle-btn.active & {
      color: $brand-primary;
   }

   .toggle-btn:not(.active) & {
      color: #94a3b8;
   }
}
</style>
