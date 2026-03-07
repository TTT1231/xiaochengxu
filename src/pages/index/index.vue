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
            <view
               class="category-sidebar"
               :style="{ top: headerHeight + 'px' }"
            >
               <view
                  v-for="category in categories"
                  :key="category.id"
                  class="category-item"
                  :class="{ active: activeCategoryId === category.id }"
                  @click="handleCategorySelect(category.id)"
               >
                  <image
                     class="category-icon"
                     :src="
                        activeCategoryId === category.id
                           ? category.activeIcon || category.icon
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
                  v-for="category in categories"
                  :key="category.id"
                  :id="'section-' + category.id"
                  class="category-section"
               >
                  <!-- 分类标题 -->
                  <view class="section-header">
                     <text class="section-title">{{ category.name }}</text>
                  </view>
                  <!-- 产品列表 -->
                  <view class="product-list">
                     <ProductCard
                        v-for="product in getProductsByCategory(category.id)"
                        :key="product.id"
                        :product="product"
                        :quantity="getItemQuantity(product.id)"
                        @add="handleAddToCart(product)"
                        @remove="handleRemoveFromCart(product.id)"
                     />
                  </view>
               </view>
               <!-- 底部留白 -->
               <view class="bottom-spacer"></view>
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Product } from '@/types';
import { categories, products } from '@/mock';
import { useCart } from '@/composables/useCart';
import { onReady, onPageScroll } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductCard from '@/components/home/ProductCard.vue';
import FloatingCart from '@/components/home/FloatingCart.vue';

const activeCategoryId = ref<string>(categories[0]?.id || '');
const headerHeight = ref(0);
const isScrolling = ref(false);
const currentScrollTop = ref(0);

const { totalCount, totalAmount, addItem, removeItem, getItemQuantity } =
   useCart();

// 按分类获取产品
const getProductsByCategory = (categoryId: string): Product[] => {
   return products.filter(p => p.categoryId === categoryId);
};

onReady(() => {
   const systemInfo = uni.getSystemInfoSync();
   const statusBarHeight = systemInfo.statusBarHeight || 0;
   headerHeight.value = statusBarHeight + 116;
});

// 监听页面滚动
onPageScroll(e => {
   currentScrollTop.value = e.scrollTop;
   if (isScrolling.value) return;
   updateActiveCategory();
});

// 点击分类 - 滚动到对应位置
const handleCategorySelect = (id: string): void => {
   activeCategoryId.value = id;
   isScrolling.value = true;

   const query = uni.createSelectorQuery();
   query.select('#section-' + id).boundingClientRect();
   query.exec(res => {
      if (res && res[0]) {
         const sectionRect = res[0];
         // 计算目标滚动位置：当前滚动位置 + 元素距视口顶部的距离 - header高度 - 一些偏移
         const targetScrollTop =
            currentScrollTop.value + sectionRect.top - headerHeight.value - 10;
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

// 根据滚动位置更新激活分类
const updateActiveCategory = (): void => {
   const query = uni.createSelectorQuery();

   categories.forEach(cat => {
      query.select('#section-' + cat.id).boundingClientRect();
   });

   query.exec(rects => {
      if (!rects || rects.length === 0) return;

      // 使用 header 高度作为阈值，当 section 顶部到达 header 下方时激活
      const threshold = headerHeight.value + 50;

      for (let i = rects.length - 1; i >= 0; i--) {
         const rect = rects[i];
         if (rect && rect.top <= threshold) {
            const cat = categories[i];
            if (cat && activeCategoryId.value !== cat.id) {
               activeCategoryId.value = cat.id;
            }
            break;
         }
      }
   });
};

const handleAddToCart = (product: Product): void => {
   addItem(product);
};

const handleRemoveFromCart = (productId: string): void => {
   removeItem(productId);
};

const handleCartClick = (): void => {
   uni.navigateTo({ url: '/pages/cart/index' });
};
</script>

<style lang="scss" scoped>
.page {
   min-height: 100vh;
   background-color: $bg-page;
}

// 内容区域容器 - 灰色背景作为左侧分类栏的延伸
.content-wrapper {
   display: flex;
   flex-direction: row;
   background-color: #f8fafc; // 左侧分类栏的背景色
}

// 左侧分类栏 - sticky 吸顶
.category-sidebar {
   position: sticky;
   width: 192rpx;
   height: fit-content;
   flex-shrink: 0;
   background-color: transparent; // 透明，使用父容器背景
   z-index: 50;
   display: flex;
   flex-direction: column;
   padding-bottom: 280rpx; // 与 .bottom-spacer 保持一致
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

// 主内容区域
.main-content {
   // 移除 min-height 和 padding-bottom
   // 购物车是 fixed 定位，不需要为它预留 padding 空间
   // 底部留白由 .bottom-spacer 处理
}

// 产品区域
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

// 底部留白 - 防止最后的内容被购物车遮挡，并留出舒适的点击空间
// 购物车条高度 112rpx + 图标向上延伸 32rpx + 舒适间距 48rpx ≈ 192rpx
// 加上 TabBar 区域的视觉平衡，总共需要约 280rpx
.bottom-spacer {
   height: 280rpx;
   background-color: $bg-card; // 确保是白色背景，不是灰色
}
</style>
