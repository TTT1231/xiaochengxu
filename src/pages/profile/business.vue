<script setup lang="ts">
import { ref } from 'vue';
import { onReady } from '@dcloudio/uni-app';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import { resolveFileID } from '@/utils/cloudStorage';
import { useEnvConfig } from '@/hooks/useEnvConfig';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
const { cloudStoragePrefix } = useEnvConfig();

const LICENSE_CLOUD_PATH = cloudStoragePrefix + 'zhengjian/yinyezhizhao.png';
const licenseUrl = ref('');
const loaded = ref(false);

onReady(async () => {
   try {
      licenseUrl.value = await resolveFileID(LICENSE_CLOUD_PATH);
   } catch {
      uni.showToast({ title: '图片加载失败', icon: 'none' });
   }
});

const handlePreview = () => {
   if (!licenseUrl.value) return;
   uni.previewImage({
      urls: [licenseUrl.value],
      current: licenseUrl.value,
   });
};
</script>

<template>
   <view class="page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="经营公示" />

      <scroll-view class="content" scroll-y>
         <view class="content-inner">
            <!-- 证照卡片 -->
            <view class="license-card" :class="{ 'card-loaded': loaded }" @click="handlePreview">
               <!-- 顶部装饰条 -->
               <view class="card-accent">
                  <view class="accent-dot" />
                  <text class="accent-text">营业执照</text>
                  <view class="accent-dot" />
               </view>

               <!-- 图片容器 -->
               <view class="image-wrap">
                  <image
                     class="license-image"
                     :src="licenseUrl"
                     mode="widthFix"
                     @load="loaded = true"
                  />
               </view>

               <!-- 底部提示 -->
               <view class="card-footer">
                  <text class="footer-text">点击查看原图</text>
               </view>
            </view>

            <view class="bottom-spacer" />
         </view>
      </scroll-view>
   </view>
</template>

<style lang="scss" scoped>
.page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

.content {
   height: calc(100vh - var(--header-height, 0px) - env(safe-area-inset-bottom));
}

.content-inner {
   padding: 32rpx;
}

/* ─── 证照卡片 ─── */
.license-card {
   background-color: $bg-card;
   border-radius: $radius-xl;
   overflow: hidden;
   box-shadow:
      0 4rpx 24rpx rgba(0, 0, 0, 0.06),
      0 1rpx 4rpx rgba(0, 0, 0, 0.04);
   opacity: 0;
   transform: translateY(24rpx);
   transition:
      opacity 0.5s ease,
      transform 0.5s ease;

   &.card-loaded {
      opacity: 1;
      transform: translateY(0);
   }

   &:active {
      opacity: 0.92;
   }
}

/* ─── 顶部装饰条 ─── */
.card-accent {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 16rpx;
   padding: 24rpx 0 16rpx;
   background: linear-gradient(to right, transparent, rgba(238, 134, 43, 0.06), transparent);
}

.accent-dot {
   width: 8rpx;
   height: 8rpx;
   border-radius: 50%;
   background-color: $brand-primary;
   opacity: 0.4;
}

.accent-text {
   font-size: 24rpx;
   color: $text-muted;
   letter-spacing: 8rpx;
}

/* ─── 图片区域 ─── */
.image-wrap {
   padding: 16rpx 32rpx;
}

.license-image {
   width: 100%;
   border-radius: $radius-sm;
}

/* ─── 底部提示 ─── */
.card-footer {
   padding: 16rpx 0 28rpx;
   display: flex;
   justify-content: center;
}

.footer-text {
   font-size: 22rpx;
   color: $text-muted;
   letter-spacing: 2rpx;
}

.bottom-spacer {
   height: 64rpx;
}
</style>
