<template>
   <view class="order-toggle">
      <view
         class="toggle-btn"
         :class="{ active: active }"
         @click="handleToggle(true)"
      >
         <text class="btn-text">当前订单</text>
      </view>
      <view
         class="toggle-btn"
         :class="{ active: !active }"
         @click="handleToggle(false)"
      >
         <text class="btn-text">历史订单</text>
      </view>
   </view>
</template>

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

<style lang="scss" scoped>
.order-toggle {
   display: flex;
   width: 320rpx;
   height: 72rpx;
   background-color: #f5f5f5;
   border-radius: $radius-full;
   padding: 6rpx;
}

.toggle-btn {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: $radius-full;
   transition:
      background-color 0.3s,
      opacity 0.3s;

   &.active {
      background-color: $brand-primary;
   }

   &:not(.active) {
      opacity: 0.6;
   }
}

.btn-text {
   font-size: 28rpx;
   font-weight: 500;

   .toggle-btn.active & {
      color: #ffffff;
   }

   .toggle-btn:not(.active) & {
      color: $text-secondary;
   }
}
</style>
