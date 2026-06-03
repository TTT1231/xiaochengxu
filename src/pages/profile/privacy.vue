<script setup lang="ts">
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
</script>

<template>
   <view class="page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="隐私政策" />
      <scroll-view class="content" scroll-y>
         <view class="content-inner">
            <view class="meta">
               <text class="meta-text">更新日期：2025年6月1日</text>
               <text class="meta-divider">·</text>
               <text class="meta-text">生效日期：2025年6月1日</text>
            </view>

            <text class="section-title">引言</text>
            <text class="body-text">
               甜品屋（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规的规定，保护您的个人信息及隐私安全。本隐私政策旨在向您说明，在您使用甜品屋小程序（以下简称"本小程序"）时，我们如何收集、使用、存储、共享和保护您的个人信息，以及您所享有的相关权利。
            </text>

            <view class="divider" />

            <text class="section-title">一、我们收集的信息</text>
            <text class="body-text">
               1.1
               注册信息：当您注册成为本小程序用户时，我们会收集您的微信昵称、头像等基础信息，用于识别您的身份和展示个人资料。
            </text>
            <text class="body-text">
               1.2
               订单信息：当您通过本小程序下单购买糕点、小食、饮料等商品时，我们会收集您的订单信息，包括商品名称、数量、规格、金额、下单时间、取餐方式等，以便为您提供订单服务和售后支持。
            </text>
            <text class="body-text">
               1.3
               交易信息：我们会记录您的消费记录、积分变动、会员卡信息等，用于积分管理、会员权益发放和账户余额管理。
            </text>
            <text class="body-text">
               1.4
               设备信息：为保障小程序正常运行和安全防护，我们会收集您的设备型号、操作系统版本、微信版本等基本信息。
            </text>

            <view class="divider" />

            <text class="section-title">二、信息的使用</text>
            <text class="body-text">
               2.1
               我们使用收集的信息来提供、维护和改进我们的服务，包括处理订单、管理积分、推送优惠通知等。
            </text>
            <text class="body-text">
               2.2
               我们会根据您的消费偏好，向您推荐可能感兴趣的糕点、饮品等商品或优惠活动。您可以在个人中心关闭个性化推荐。
            </text>
            <text class="body-text">
               2.3
               我们不会将您的个人信息用于本政策未载明的其他用途，除非获得您的明确同意或法律法规允许。
            </text>

            <view class="divider" />

            <text class="section-title">三、信息的存储与保护</text>
            <text class="body-text">
               3.1
               您的个人信息存储于微信云开发平台，我们采用数据加密、访问控制、安全审计等技术措施保障信息安全。
            </text>
            <text class="body-text">
               3.2
               我们仅在实现服务目的所必需的时间内保留您的个人信息，超出期限后将进行删除或匿名化处理。
            </text>
            <text class="body-text">
               3.3 如发生个人信息安全事件，我们将按照法律法规要求及时告知您，并向监管部门报告。
            </text>

            <view class="divider" />

            <text class="section-title">四、信息的共享与披露</text>
            <text class="body-text">
               4.1 我们不会将您的个人信息出售给任何第三方。在以下情形中，我们可能共享您的信息：
            </text>
            <text class="body-text body-text--bullet"> • 获得您的明确同意或授权后 </text>
            <text class="body-text body-text--bullet">
               • 与第三方配送服务商共享必要的订单信息以完成配送（如适用）
            </text>
            <text class="body-text body-text--bullet"> • 根据法律法规规定或政府部门要求 </text>
            <text class="body-text body-text--bullet"> • 为保护我们及用户的合法权益所必需 </text>

            <view class="divider" />

            <text class="section-title">五、您的权利</text>
            <text class="body-text">
               5.1 您有权查询、更正您的个人信息，可在个人中心页面修改昵称、手机号等信息。
            </text>
            <text class="body-text">
               5.2
               您有权删除您的账户。请注意，删除账户后，您的订单记录、积分等数据将被清除且无法恢复。您可通过联系客服申请账户删除。
            </text>
            <text class="body-text">
               5.3 您有权随时撤回对个人信息收集和使用的同意，但撤回不影响撤回前已进行的处理活动。
            </text>

            <view class="divider" />

            <text class="section-title">六、未成年人保护</text>
            <text class="body-text">
               我们高度重视未成年人个人信息的保护。如果您是未满18周岁的未成年人，请在法定监护人的陪同下阅读本隐私政策，并在征得监护人同意后使用本小程序。
            </text>

            <view class="divider" />

            <text class="section-title">七、Cookie及同类技术</text>
            <text class="body-text">
               本小程序基于微信平台运行，可能涉及微信平台自身的Cookie机制。我们不会单独设置Cookie或使用同类技术追踪您的行为。
            </text>

            <view class="divider" />

            <text class="section-title">八、政策更新</text>
            <text class="body-text">
               我们可能适时修订本隐私政策。更新后的政策将在本小程序中公布，并标注更新日期。如涉及重大变更，我们将通过小程序内弹窗或消息通知等方式告知您。
            </text>

            <view class="divider" />

            <text class="section-title">九、联系我们</text>
            <text class="body-text">
               如您对本隐私政策有任何疑问、意见或建议，可通过以下方式联系我们：
            </text>
            <text class="body-text body-text--bullet"> • 客服邮箱：privacy@dessert-house.cn </text>
            <text class="body-text body-text--bullet"> • 客服电话：400-888-6666 </text>
            <text class="body-text body-text--bullet"> • 小程序内联系在线客服 </text>

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
   padding: 0 40rpx;
}

.meta {
   display: flex;
   align-items: center;
   padding: 32rpx 0;
}

.meta-text {
   font-size: 24rpx;
   color: $text-muted;
}

.meta-divider {
   margin: 0 12rpx;
   font-size: 24rpx;
   color: $text-muted;
}

.section-title {
   display: block;
   font-size: 32rpx;
   font-weight: 600;
   color: $text-primary;
   margin-top: 8rpx;
   margin-bottom: 24rpx;
   padding-left: 16rpx;
   border-left: 6rpx solid $brand-primary;
   line-height: 40rpx;
}

.body-text {
   display: block;
   font-size: 28rpx;
   color: $text-secondary;
   line-height: 48rpx;
   margin-bottom: 8rpx;
   text-align: justify;
   word-break: break-all;
   word-wrap: break-word;
}

.body-text--bullet {
   padding-left: 16rpx;
}

.divider {
   height: 1rpx;
   background-color: $border-light;
   margin: 40rpx 0;
}

.bottom-spacer {
   height: 64rpx;
}
</style>
