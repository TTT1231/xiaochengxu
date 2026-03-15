<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHomeStore, useCartStore } from '@/stores';
import { onPageScroll, onLoad } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductCard from '@/components/home/ProductCard.vue';
import FloatingCart from '@/components/home/FloatingCart.vue';
import { useHeaderHeight } from '@/composables/useHeaderHeight';

const homeStore = useHomeStore();
const cartStore = useCartStore();

const activeCategoryId = ref<number>(0);
const { headerHeight } = useHeaderHeight();
const isScrolling = ref(false);
const currentScrollTop = ref(0);

const { totalCount, totalAmount } = storeToRefs(cartStore);
const { getItemQuantity } = cartStore;

const getProductsByCategory = homeStore.getProductsByCategory;

onLoad(async () => {
   await homeStore.fetchData();
   if (!activeCategoryId.value && homeStore.categories.length > 0) {
      activeCategoryId.value = homeStore.categories[0]._id;
   }
});

watch(
   () => homeStore.categories,
   cats => {
      if (cats.length > 0 && !activeCategoryId.value) {
         activeCategoryId.value = cats[0]._id;
      }
   },
);

const handleCategorySelect = (id: number): void => {
   activeCategoryId.value = id;
   isScrolling.value = true;

   const query = uni.createSelectorQuery();
   query.select('#section-' + id).boundingClientRect();
   query.exec(res => {
      if (res && res[0]) {
         const sectionRect = res[0];
         const targetScrollTop = currentScrollTop.value + sectionRect.top - headerHeight.value - 10;
         uni.pageScrollTo({
            scrollTop: targetScrollTop,
            duration: 300,
         });
      }
   });

   setTimeout(() => {
      isScrolling.value = false;
   }, 400);
};

const updateActiveCategory = (): void => {
   const query = uni.createSelectorQuery();

   homeStore.categories.forEach(cat => {
      query.select('#section-' + cat._id).boundingClientRect();
   });

   query.exec(rects => {
      if (!rects || rects.length === 0) return;

      const threshold = headerHeight.value + 50;

      for (let i = rects.length - 1; i >= 0; i--) {
         const rect = rects[i];
         if (rect && rect.top <= threshold) {
            const cat = homeStore.categories[i];
            if (cat && activeCategoryId.value !== cat._id) {
               activeCategoryId.value = cat._id;
            }
            break;
         }
      }
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
         <!-- Banner -->
         <Banner />

         <!-- 内容区域：sidebar + products -->
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
               <!-- 每个分类一个区块 -->
               <view
                  v-for="category in homeStore.categories"
                  :key="category._id"
                  :id="'section-' + category._id"
                  class="category-section"
               >
                  <!-- 分类标题 -->
                  <view class="section-header">
                     <text class="section-title">{{ category.name }}</text>
                  </view>
                  <!-- 产品列表 -->
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
               <!-- 底部留白 -->
               <view class="bottom-spacer" :class="{ 'has-cart': totalCount > 0 }"></view>
            </view>
         </view>
      </view>

      <!-- 悬浮购物车 -->
      <FloatingCart
         v-if="totalCount > 0"
         :count="totalCount"
         :amount="totalAmount"
         :discount="5"
         @click="handleCartClick"
      />

      <!-- 底部导航 -->
      <TabBar :current="0" />
   </view>
</template>

<style lang="scss" scoped>
.page {
   min-height: 100vh;
   background-color: $bg-page;
   padding-bottom: 128rpx;
   box-sizing: border-box;
}

.content-wrapper {
   display: flex;
   flex-direction: row;
   background-color: #f8fafc;
}

.category-sidebar {
   position: sticky;
   width: 192rpx;
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
   padding: 40rpx 8rpx;
   border-left: 8rpx solid transparent;
   transition: all 0.2s;
   background-color: transparent;

   &.active {
      background-color: $bg-card;
      border-left-color: $brand-primary;

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
   background-color: #ffffff;
}

.product-area {
   flex: 1;
   background-color: $bg-card;
   padding: 0 24rpx;
}

.category-section {
   padding-top: 8rpx;
}

.section-header {
   padding: 32rpx 0;
}

.section-title {
   font-size: 28rpx;
   color: $text-muted;
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
