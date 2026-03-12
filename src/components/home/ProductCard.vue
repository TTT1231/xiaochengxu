<script setup lang="ts">
import type { Products } from '@/types';
import { formatPriceDisplay } from '@/utils/format';

interface Props {
   product: Products;
   quantity?: number;
}

const props = defineProps<Props>();

/** 获取产品主图（第一张） */
const mainImage = props.product.images ? props.product.images.split('&')[0] : '';

interface Emits {
   (e: 'add'): void;
   (e: 'click'): void;
}

const emit = defineEmits<Emits>();

const handleClick = (): void => {
   emit('click');
};
</script>

<template>
   <view class="card-container" @click="handleClick">
      <image class="card-cover" :src="mainImage" mode="aspectFill" />

      <view class="card-content">
         <view class="text-group">
            <view class="title">{{ product.name }}</view>
            <view class="desc" v-if="product.description">{{ product.description }}</view>
         </view>

         <view class="bottom-group">
            <view class="price">{{ formatPriceDisplay(product.price) }}</view>
            <view class="action-btn">
               <!-- 移除文字加号，完全使用 CSS 伪元素绘制完美居中的加号 -->
               <view v-if="quantity && quantity > 0" class="badge">
                  <text class="badge-num">{{ quantity }}</text>
               </view>
            </view>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
/* 容器：纯净的弹性盒子，严格控制100%宽度 */
.card-container {
   display: flex;
   width: 100%;
   padding: 0;
   box-sizing: border-box;
}

/* 左侧图片：定死大小和圆角，绝对不缩放 */
.card-cover {
   width: 192rpx;
   height: 192rpx;
   border-radius: 32rpx;
   background-color: #f8fafc;
   flex-shrink: 0;
}

/* 右侧内容：神级防御！通过绝对限制最大宽度来防止任何弹性延伸 */
.card-content {
   flex: 1;
   min-width: 0;
   /* 给右侧留出充足的留白空间：192(图片) + 24(左距) + 32(右距) = 248 */
   max-width: calc(100% - 248rpx);
   margin-left: 24rpx;
   margin-right: 32rpx; /* UI核心：加大右侧留白！建立一堵隐形的墙，消除“冲出去”的错觉 */
   display: flex;
   flex-direction: column;
   justify-content: space-between; /* 拉开上下间距 */
   padding: 10rpx 0; /* 上下向中心收拢一点点，视觉上与左侧图片的圆角形成更好的呼应 */
   box-sizing: border-box;
}

/* 顶部文字区域：严格锁定宽度，再次上锁防止 view 的默认块级撑开打乱 Flex */
.text-group {
   width: 100%;
   min-width: 0;
   display: flex;
   flex-direction: column;
}

.title {
   font-size: 28rpx;
   font-weight: bold;
   color: $text-primary;
   line-height: 40rpx;
   display: block;
   width: 100%;
   /* 真正生效的单行文本省略号三件套（缺一不可） */
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.desc {
   font-size: 22rpx;
   color: $text-tertiary;
   line-height: 32rpx;
   margin-top: 6rpx;
   width: 100%;
   /* 对抗小程序 <view> 不响应单行截断的备用方案：两行截断 */
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 2; /* 改为2行截断 */
   overflow: hidden;
   word-break: break-all;
}

/* 底部价格与按钮：两端对齐 */
.bottom-group {
   display: flex;
   align-items: center;
   justify-content: space-between; /* 按钮在最右侧，价格在最左侧 */
   width: 100%;
   /* 移除 padding-right，恢复右侧所有元素的完美垂直对齐 */
   box-sizing: border-box;
}

.price {
   font-size: 32rpx;
   font-weight: 700;
   color: $brand-primary;
   line-height: 1;
   font-family: 'Plus Jakarta Sans', sans-serif;
   flex: 1;
   min-width: 0;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   margin-right: 20rpx;
}

/* 加号按钮：写死物理大小，不再受任何祖先节点脸色 */
.action-btn {
   width: 48rpx;
   height: 48rpx;
   background-color: $brand-primary;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
   flex-shrink: 0;
}

/* 完美像素居中的加号符号 */
.action-btn::before,
.action-btn::after {
   content: '';
   position: absolute;
   background-color: $uni-text-color-inverse;
   border-radius: 4rpx;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
}

.action-btn::before {
   width: 22rpx;
   height: 4rpx;
}

.action-btn::after {
   width: 4rpx;
   height: 22rpx;
}

/* 数量红点角标 */
.badge {
   position: absolute;
   top: -12rpx;
   right: -12rpx;
   background-color: $badge-count;
   border: 2rpx solid $uni-text-color-inverse;
   border-radius: 16rpx;
   min-width: 32rpx;
   height: 32rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0 8rpx;
   box-sizing: border-box;
}

.badge-num {
   font-size: 18rpx;
   color: $uni-text-color-inverse;
   font-weight: bold;
   line-height: 1;
   font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
