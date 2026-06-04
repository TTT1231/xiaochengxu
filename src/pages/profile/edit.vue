<script setup lang="ts">
import { ref, computed } from 'vue';

import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
const userStore = useUserStore();

const phone = ref('');
const originalPhone = ref('');
const isSaving = ref(false);

const nickname = computed(() => userStore.user?.name ?? '');

const hasPhone = computed(() => !!phone.value);
const displayPhone = computed(() => {
   const p = phone.value;
   if (!p || p.length !== 11) return p || '';
   return p.slice(0, 3) + '****' + p.slice(7);
});

const hasChanges = computed(() => phone.value !== originalPhone.value);

onShow(() => {
   const user = userStore.user;
   if (user) {
      phone.value = user.phone ?? '';
      originalPhone.value = user.phone ?? '';
   }
});

async function handleSave(): Promise<void> {
   if (!hasChanges.value || isSaving.value) return;

   isSaving.value = true;
   try {
      const params: Record<string, string> = {};
      if (phone.value && phone.value !== originalPhone.value) {
         if (!/^1[3-9]\d{9}$/.test(phone.value)) {
            uni.showToast({ title: '手机号格式不正确', icon: 'none' });
            return;
         }
         params.phone = phone.value;
      }

      if (Object.keys(params).length === 0) {
         isSaving.value = false;
         return;
      }

      const result = await userStore.updateUserProfile(params);
      if (result.success) {
         if (params.phone) {
            originalPhone.value = params.phone;
            phone.value = params.phone;
         }
         uni.showToast({ title: '保存成功', icon: 'success' });
         setTimeout(() => {
            uni.navigateBack();
         }, 1000);
      } else {
         uni.showToast({ title: result.message, icon: 'none' });
      }
   } catch (error) {
      uni.showToast({
         title: error instanceof Error ? error.message : '保存失败',
         icon: 'none',
      });
   } finally {
      isSaving.value = false;
   }
}

function handleBindPhone(): void {
   uni.showModal({
      title: hasPhone.value ? '修改手机号' : '绑定手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: res => {
         if (res.confirm && res.content) {
            const input = res.content.trim();
            if (!/^1[3-9]\d{9}$/.test(input)) {
               uni.showToast({ title: '手机号格式不正确', icon: 'none' });
               return;
            }
            phone.value = input;
         }
      },
   });
}
</script>

<template>
   <view class="edit-page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="个人资料" />

      <!-- 头像展示区（纯展示，不可修改） -->
      <view class="avatar-section">
         <view class="avatar-ring">
            <image class="avatar-img" src="/static/images/avatar.png" mode="aspectFill" />
         </view>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
         <!-- 昵称（不可修改） -->
         <view class="form-item">
            <text class="form-label">昵称</text>
            <view class="form-value">
               <text class="form-text">{{ nickname }}</text>
            </view>
         </view>

         <view class="form-divider" />

         <!-- 手机号 -->
         <view class="form-item" @click="handleBindPhone()">
            <text class="form-label">手机号</text>
            <view class="form-value form-value--phone">
               <text v-if="hasPhone" class="phone-bound">{{ displayPhone }}</text>
               <text v-else class="phone-unbound">点击绑定</text>
               <text class="arrow">›</text>
            </view>
         </view>
      </view>

      <!-- 保存按钮 -->
      <view class="btn-wrap">
         <view
            class="save-btn"
            :class="{ 'save-btn--disabled': !hasChanges || isSaving }"
            @click="handleSave"
         >
            <text class="save-btn-text">{{ isSaving ? '保存中...' : '保存修改' }}</text>
         </view>
      </view>
   </view>
</template>

<style lang="scss" scoped>
.edit-page {
   min-height: 100vh;
   background-color: $bg-page;
   box-sizing: border-box;
}

/* ---- 头像展示区 ---- */
.avatar-section {
   display: flex;
   justify-content: center;
   padding: 48rpx 0 40rpx;
}

.avatar-ring {
   width: 176rpx;
   height: 176rpx;
   border-radius: $radius-full;
   background: linear-gradient(135deg, $brand-primary 0%, #f5a623 100%);
   display: flex;
   align-items: center;
   justify-content: center;
}

.avatar-img {
   width: 160rpx;
   height: 160rpx;
   border-radius: $radius-full;
   background-color: #6bb2aa;
}

/* ---- 表单卡片 ---- */
.form-card {
   margin: 0 24rpx;
   background-color: $bg-card;
   border-radius: $radius-lg;
   padding: 0 32rpx;
   box-shadow: $shadow-card;
}

.form-item {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 36rpx 0;
}

.form-divider {
   height: 1rpx;
   background-color: $border-light;
   margin-left: 160rpx;
}

.form-label {
   font-size: 30rpx;
   color: $text-secondary;
   flex-shrink: 0;
   width: 140rpx;
}

.form-value {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: flex-end;
}

.form-input {
   width: 100%;
   text-align: right;
   font-size: 30rpx;
   color: $text-primary;
}

.form-text {
   font-size: 30rpx;
   color: $text-tertiary;
}

.phone-bound {
   font-size: 30rpx;
   color: $text-primary;
   letter-spacing: 2rpx;
}

.phone-unbound {
   font-size: 28rpx;
   color: $brand-primary;
}

.arrow {
   margin-left: 8rpx;
   font-size: 36rpx;
   color: $text-muted;
   line-height: 1;
}

/* ---- 保存按钮 ---- */
.btn-wrap {
   padding: 64rpx 24rpx 0;
}

.save-btn {
   background: linear-gradient(135deg, $brand-primary 0%, $brand-primary-dark 100%);
   border-radius: $radius-full;
   padding: 26rpx 0;
   text-align: center;
   box-shadow: 0 8rpx 24rpx rgba(238, 134, 43, 0.3);
   transition: opacity 0.2s ease;

   &--disabled {
      opacity: 0.45;
      box-shadow: none;
   }
}

.save-btn-text {
   font-size: 32rpx;
   font-weight: 600;
   color: #ffffff;
   letter-spacing: 2rpx;
}
</style>
