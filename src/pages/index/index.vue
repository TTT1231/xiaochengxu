<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHomeStore, useCartStore } from '@/stores';
import { onReady, onPageScroll, onLoad } from '@dcloudio/uni-app';
import Header from '@/components/common/Header.vue';
import TabBar from '@/components/common/TabBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductCard from '@/components/home/ProductCard.vue';
import FloatingCart from '@/components/home/FloatingCart.vue';

const homeStore = useHomeStore();
const cartStore = useCartStore();

const activeCategoryId = ref<number>(0);
const headerHeight = ref(0);
const isScrolling = ref(false);
const currentScrollTop = ref(0);

// storeToRefs 保持 computed 的响应性，addItem/getItemQuantity 是函数直接解构
const { totalCount, totalAmount } = storeToRefs(cartStore);
const { getItemQuantity } = cartStore;

// 获取指定分类的产品
const getProductsByCategory = homeStore.getProductsByCategory;

onLoad(async () => {
   await homeStore.fetchData();
   if (!activeCategoryId.value && homeStore.categories.length > 0) {
      activeCategoryId.value = homeStore.categories[0]._id;
   }
});

// 数据加载完后初始化激活分类
watch(
   () => homeStore.categories,
   cats => {
      if (cats.length > 0 && !activeCategoryId.value) {
         activeCategoryId.value = cats[0]._id;
      }
   },
);

onReady(() => {
   const windowInfo = uni.getWindowInfo();
   const statusBarHeight = windowInfo.statusBarHeight || 0;

   let menuTop = statusBarHeight;
   let menuHeight = 32;

   // #ifdef MP-WEIXIN
   const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
   menuTop = menuButtonInfo.top;
   menuHeight = menuButtonInfo.height;
   // #endif

   // 计算 Header 高度: paddingTop(menuTop) + menuHeight + padding-bottom(20rpx)
   headerHeight.value = menuTop + menuHeight + Math.ceil(uni.upx2px(20));
});

// 监听页面滚动
onPageScroll(e => {
   currentScrollTop.value = e.scrollTop;
   if (isScrolling.value) return;
   updateActiveCategory();
});

// 点击分类 - 滚动到对应位置
const handleCategorySelect = (id: number): void => {
   activeCategoryId.value = id;
   isScrolling.value = true;

   const query = uni.createSelectorQuery();
   query.select('#section-' + id).boundingClientRect();
   query.exec(res => {
      if (res && res[0]) {
         const sectionRect = res[0];
         // 计算目标滚动位置：当前滚动位置 + 元素距视口顶部的距离 - header高度 - 一些偏移
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

// 根据滚动位置更新激活分类
const updateActiveCategory = (): void => {
   const query = uni.createSelectorQuery();

   homeStore.categories.forEach(cat => {
      query.select('#section-' + cat._id).boundingClientRect();
   });

   query.exec(rects => {
      if (!rects || rects.length === 0) return;

      // 使用 header 高度作为阈值，当 section 顶部到达 header 下方时激活
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
   /* 为 TabBar 留出空间 */
   padding-bottom: 128rpx;
   box-sizing: border-box;
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
   padding-bottom: 40rpx; // 去除过大留白
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
   background-color: #ffffff;
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

// 底部留白 - 动态高度，有购物车时才撑开大口子，平时留小口子防止界面太空旷
.bottom-spacer {
   height: 60rpx;
   background-color: transparent;
   transition: height 0.3s;

   &.has-cart {
      /* 购物车条高度 112rpx + 图标向上延伸 32rpx + 舒适间距 76rpx = 220rpx */
      height: 220rpx;
   }
}
</style>
