<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHomeStore, useCartStore } from '@/stores';
import { onLoad, onPageScroll } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductCard from '@/components/home/ProductCard.vue';
import FloatingCart from '@/components/home/FloatingCart.vue';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

const homeStore = useHomeStore();
const cartStore = useCartStore();

const activeCategoryId = ref<string>('0');
const { headerHeight } = useHeaderHeight();
const currentScrollTop = ref(0);
let scrollSyncTimer: ReturnType<typeof setTimeout> | null = null;
let programmaticScrollEndTimer: ReturnType<typeof setTimeout> | null = null;
let programmaticScrollTargetId: string | null = null;

interface SectionRect {
   top: number;
}

const { totalCount, totalAmount, totalDiscount } = storeToRefs(cartStore);
const { getItemQuantity } = cartStore;

const getProductsByCategory = homeStore.getProductsByCategory;

onLoad(async () => {
   await homeStore.fetchData();
   if (activeCategoryId.value === '0' && homeStore.categories.length > 0) {
      activeCategoryId.value = homeStore.categories[0]._id;
   }
});

watch(
   () => homeStore.categories,
   cats => {
      if (cats.length > 0 && activeCategoryId.value === '0') {
         activeCategoryId.value = cats[0]._id;
      }
   },
);

const querySectionRect = (id: string, callback: (rect: SectionRect | undefined) => void): void => {
   const query = uni.createSelectorQuery();
   query.select('#section-' + id).boundingClientRect();
   query.exec(res => {
      callback(res?.[0] as SectionRect | undefined);
   });
};

const syncActiveCategoryByScroll = (): void => {
   if (programmaticScrollTargetId) return;

   const categories = homeStore.categories;
   if (categories.length === 0) return;

   const query = uni.createSelectorQuery();
   query.selectAll('.category-section').boundingClientRect();
   query.exec(res => {
      if (programmaticScrollTargetId) return;

      const sections = (res?.[0] ?? []) as SectionRect[];
      if (sections.length === 0) return;

      const activationLine = headerHeight.value + uni.upx2px(40);
      const activeIndex = sections.reduce((lastVisibleIndex, section, index) => {
         return section.top <= activationLine ? index : lastVisibleIndex;
      }, 0);
      const activeCategory = categories[activeIndex];
      if (activeCategory && activeCategoryId.value !== activeCategory._id) {
         activeCategoryId.value = activeCategory._id;
      }
   });
};

const scheduleActiveCategorySync = (): void => {
   if (scrollSyncTimer) return;

   scrollSyncTimer = setTimeout(() => {
      scrollSyncTimer = null;
      syncActiveCategoryByScroll();
   }, 80);
};

const releaseProgrammaticScrollLock = (delay = 180): void => {
   if (programmaticScrollEndTimer) {
      clearTimeout(programmaticScrollEndTimer);
   }

   programmaticScrollEndTimer = setTimeout(() => {
      programmaticScrollTargetId = null;
      programmaticScrollEndTimer = null;
   }, delay);
};

onPageScroll(({ scrollTop }) => {
   currentScrollTop.value = scrollTop;

   if (programmaticScrollTargetId) {
      activeCategoryId.value = programmaticScrollTargetId;
      releaseProgrammaticScrollLock();
      return;
   }

   scheduleActiveCategorySync();
});

const handleCategorySelect = (id: string): void => {
   if (scrollSyncTimer) {
      clearTimeout(scrollSyncTimer);
      scrollSyncTimer = null;
   }

   programmaticScrollTargetId = id;
   activeCategoryId.value = id;
   releaseProgrammaticScrollLock(1000);

   nextTick(() => {
      querySectionRect(id, sectionRect => {
         if (!sectionRect) return;
         const targetScrollTop = Math.max(
            0,
            currentScrollTop.value + sectionRect.top - headerHeight.value - uni.upx2px(10),
         );
         uni.pageScrollTo({
            scrollTop: targetScrollTop,
            duration: 300,
         });
      });
   });
};

const handleCartClick = (): void => {
   uni.navigateTo({ url: '/pages/cart/index' });
};

const handleProductClick = (productId: string): void => {
   uni.navigateTo({
      url: `/pages/show-product-details/show-product-details?id=${productId}`,
   });
};
</script>

<template>
   <view class="page">
      <Header mode="home" />

      <!-- 主内容区域 -->
      <view class="main-content" :style="{ paddingTop: headerHeight + 'px' }">
         <Banner />

         <view class="content-wrapper">
            <!-- 左侧分类栏 - sticky 吸顶效果 -->
            <view class="category-sidebar" :style="{ top: headerHeight + 'px' }">
               <view
                  v-for="category in homeStore.categories"
                  :key="category._id"
                  class="category-item"
                  :class="{ active: activeCategoryId === category._id }"
                  @click="handleCategorySelect(category._id)"
               >
                  <image
                     class="category-icon"
                     :src="
                        activeCategoryId === category._id
                           ? category.active_icon || category.icon
                           : category.icon
                     "
                     mode="aspectFit"
                  />
                  <text class="category-name">{{ category.name }}</text>
               </view>
            </view>

            <!-- 产品列表区域 -->
            <view class="product-area">
               <view
                  v-for="category in homeStore.categories"
                  :key="category._id"
                  :id="'section-' + category._id"
                  class="category-section"
               >
                  <view class="section-header">
                     <text class="section-title">{{ category.name }}</text>
                  </view>
                  <view class="product-list">
                     <ProductCard
                        v-for="product in getProductsByCategory(category._id)"
                        :key="product._id"
                        :product="product"
                        :quantity="getItemQuantity(product._id)"
                        @click="handleProductClick(product._id)"
                     />
                  </view>
               </view>
               <view class="bottom-spacer" :class="{ 'has-cart': totalCount > 0 }"></view>
            </view>
         </view>
      </view>

      <FloatingCart
         v-if="totalCount > 0"
         :count="totalCount"
         :amount="totalAmount"
         :discount="totalDiscount"
         @click="handleCartClick"
      />

      <TabBar :current="0" />
   </view>
</template>

<style lang="scss" scoped>
.page {
   min-height: 100vh;
   background: linear-gradient(180deg, #fffdf9 0%, $bg-page 32%);
   padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
   box-sizing: border-box;
}

.content-wrapper {
   display: flex;
   flex-direction: row;
   background-color: transparent;
   padding: 0 16rpx;
   box-sizing: border-box;
   width: 100%;
   min-width: 0;
}

.category-sidebar {
   position: sticky;
   width: 166rpx;
   height: fit-content;
   flex-shrink: 0;
   background-color: transparent;
   z-index: 50;
   display: flex;
   flex-direction: column;
   padding-bottom: 40rpx;
}

.category-item {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   margin: 10rpx 8rpx;
   padding: 28rpx 8rpx;
   border-radius: 24rpx;
   transition: all 0.2s;
   background-color: transparent;

   &.active {
      background: linear-gradient(145deg, #ffffff, #fff4e8);
      box-shadow: 0 10rpx 24rpx rgba(113, 52, 20, 0.1);

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

.main-content {
   background-color: transparent;
   width: 100%;
}

.product-area {
   flex: 1;
   min-width: 0;
   background-color: transparent;
   padding: 0 12rpx 0 18rpx;
   box-sizing: border-box;
}

.category-section {
   padding-top: 8rpx;
}

.section-header {
   padding: 32rpx 0;
}

.section-title {
   font-size: 32rpx;
   font-weight: 800;
   color: $text-primary;
   line-height: 40rpx;
}

.product-list {
   display: flex;
   flex-direction: column;
   gap: 48rpx;
   padding-bottom: 24rpx;
}

.bottom-spacer {
   height: 60rpx;
   background-color: transparent;
   transition: height 0.3s;

   &.has-cart {
      height: 220rpx; // 购物车 112rpx + 延伸 32rpx + 间距 76rpx
   }
}
</style>
