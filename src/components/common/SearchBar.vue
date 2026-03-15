<script setup lang="ts">
import { commonIcons } from '@/data/imgPaths';

interface Props {
   placeholder?: string;
   modelValue?: string;
   readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
   placeholder: '搜索商品',
   modelValue: '',
   readonly: false,
});

const emit = defineEmits<{
   'update:modelValue': [value: string];
   search: [value: string];
   click: [];
}>();

const handleInput = (e: Event) => {
   const target = e.target as HTMLInputElement;
   emit('update:modelValue', target.value);
};

const handleConfirm = () => {
   emit('search', props.modelValue);
};

const handleClick = () => {
   if (props.readonly) {
      emit('click');
   }
};
</script>

<template>
   <view class="search-bar" @click="handleClick">
      <view class="search-input">
         <image class="search-icon" :src="commonIcons.search" mode="aspectFit" />
         <input
            v-if="!props.readonly"
            class="input"
            type="text"
            :placeholder="props.placeholder"
            :value="props.modelValue"
            @input="handleInput"
            @confirm="handleConfirm"
         />
         <text v-else class="placeholder">{{ props.placeholder }}</text>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.search-bar {
   padding: 16rpx 24rpx;
}

.search-input {
   display: flex;
   align-items: center;
   height: 72rpx;
   background-color: $bg-input;
   border-radius: $radius-full;
   padding: 0 24rpx;
}

.search-icon {
   width: 32rpx;
   height: 32rpx;
   margin-right: 12rpx;
   opacity: 0.6;
}

.input {
   flex: 1;
   font-size: 28rpx;
   color: $text-primary;
   line-height: 40rpx;

   &::placeholder {
      color: $text-muted;
   }
}

.placeholder {
   font-size: 28rpx;
   color: $text-muted;
   line-height: 40rpx;
}
</style>
