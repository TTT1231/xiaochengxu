<script setup lang="ts">
import { useHeaderHeight } from '@/composables/useHeaderHeight';
import Header from '@/components/common/Header.vue';

const { headerHeight } = useHeaderHeight();
</script>

<template>
   <view class="page" :style="{ paddingTop: headerHeight + 'px' }">
      <Header title="用户协议" />
      <scroll-view class="content" scroll-y>
         <view class="content-inner">
            <view class="meta">
               <text class="meta-text">更新日期：2025年6月1日</text>
               <text class="meta-divider">·</text>
               <text class="meta-text">生效日期：2025年6月1日</text>
            </view>

            <text class="section-title">引言</text>
            <text class="body-text">
               欢迎使用甜品屋小程序！甜品屋（以下简称"我们"）是一家专注于提供美味糕点、精致小食、鲜榨饮品等甜品的线上服务平台。本用户协议（以下简称"本协议"）是您与我们之间就使用甜品屋小程序（以下简称"本小程序"）及相关服务所订立的协议。请您在使用本小程序前仔细阅读本协议的全部内容。
            </text>

            <view class="divider" />

            <text class="section-title">一、服务说明</text>
            <text class="body-text">
               1.1
               本小程序为您提供以下服务：浏览糕点、小食、饮料等商品信息，在线下单购买，订单查询，积分兑换，会员卡功能等。我们经营的商品包括但不限于：面包蛋糕类（芝士蛋糕、慕斯蛋糕、吐司面包等）；中式糕点类（蛋黄酥、凤梨酥、绿豆糕等）；西式小食类（曲奇饼干、泡芙、马卡龙等）；鲜榨饮品类（果汁、奶茶、咖啡等）。
            </text>
            <text class="body-text">
               1.2
               部分服务可能产生费用，我们会在您使用相关服务前予以明确提示。商品价格以页面展示为准，我们保留根据市场情况调整价格的权利。
            </text>
            <text class="body-text">
               1.3
               我们仅提供线上订购服务，商品的制作、包装由我们的门店完成，配送服务可能由第三方配送平台提供（如适用）。
            </text>

            <view class="divider" />

            <text class="section-title">二、账户注册与使用</text>
            <text class="body-text">
               2.1
               您通过微信授权登录即可注册成为本小程序用户。您应保证提供的个人信息真实、准确、完整。
            </text>
            <text class="body-text">
               2.2
               您的账户仅限本人使用，不得以任何形式转让、出借或授权他人使用。因账户保管不善导致的损失由您自行承担。
            </text>
            <text class="body-text">
               2.3
               我们有权对存在异常行为的账户采取限制措施，包括暂停服务、冻结账户等，直至异常情况消除。
            </text>

            <view class="divider" />

            <text class="section-title">三、订单与支付</text>
            <text class="body-text">
               3.1
               您在本小程序提交订单后，系统将生成订单信息。订单成立以您成功支付为准。未支付的订单将在一定时间后自动取消。
            </text>
            <text class="body-text">
               3.2 我们支持微信支付等支付方式。支付成功后，款项将由微信支付平台结算至我们的账户。
            </text>
            <text class="body-text">
               3.3
               关于退款：如因商品质量问题、错发漏发等原因需要退款，请在下单后24小时内联系客服处理。新鲜现做类商品（如蛋糕、饮品等）无质量问题不支持退款，敬请谅解。
            </text>

            <view class="divider" />

            <text class="section-title">四、商品信息</text>
            <text class="body-text">
               4.1
               我们尽力保证商品信息（图片、描述、价格等）的准确性和及时性，但商品图片仅供参考，请以实物为准。部分商品因时令食材、制作工艺等因素可能与描述存在合理差异。
            </text>
            <text class="body-text">
               4.2
               部分糕点、饮品可能含有乳制品、鸡蛋、麸质、坚果等常见过敏原，如您有特殊饮食需求或过敏史，请在下单前仔细阅读商品描述或咨询客服。
            </text>

            <view class="divider" />

            <text class="section-title">五、积分与会员</text>
            <text class="body-text">
               5.1 消费可获得积分，积分规则以页面公示为准。积分可用于兑换指定商品或抵扣部分金额。
            </text>
            <text class="body-text">
               5.2 积分有效期为一个自然年，到期未使用的积分将自动清零，请您及时使用。
            </text>
            <text class="body-text">
               5.3
               会员卡（VIP）享有特定权益，包括但不限于会员价、专属优惠等。会员卡不可转赠、不可兑现。
            </text>

            <view class="divider" />

            <text class="section-title">六、用户行为规范</text>
            <text class="body-text"> 在使用本小程序过程中，您不得从事以下行为： </text>
            <text class="body-text body-text--bullet"> • 利用技术手段恶意刷单、套取优惠 </text>
            <text class="body-text body-text--bullet"> • 发布虚假评价或恶意诋毁他人 </text>
            <text class="body-text body-text--bullet">
               • 干扰小程序正常运行或尝试获取他人账户信息
            </text>
            <text class="body-text body-text--bullet"> • 其他违反法律法规或公序良俗的行为 </text>

            <view class="divider" />

            <text class="section-title">七、知识产权</text>
            <text class="body-text">
               本小程序中的商品图片、Logo、界面设计、文字描述等内容的知识产权归我们或相关权利人所有。未经书面许可，您不得以任何形式复制、转载或使用上述内容。
            </text>

            <view class="divider" />

            <text class="section-title">八、免责声明</text>
            <text class="body-text">
               8.1
               因不可抗力（自然灾害、疫情、政策变化等）导致服务中断或商品无法供应的，我们不承担违约责任，但将尽力减少对您的影响并采取补救措施。
            </text>
            <text class="body-text">
               8.2 因微信平台系统维护、网络故障等非我们可控因素导致的服务异常，我们不承担责任。
            </text>

            <view class="divider" />

            <text class="section-title">九、协议变更</text>
            <text class="body-text">
               我们有权根据需要修改本协议，修改后的协议将在本小程序公布。若您继续使用本小程序，即表示您同意接受修改后的协议。如您不同意修改内容，请停止使用本小程序。
            </text>

            <view class="divider" />

            <text class="section-title">十、法律适用与争议解决</text>
            <text class="body-text"> 10.1 本协议的订立、执行和解释适用中华人民共和国法律。 </text>
            <text class="body-text">
               10.2
               因本协议产生的争议，双方应友好协商解决；协商不成的，任何一方均可向我们所在地有管辖权的人民法院提起诉讼。
            </text>

            <view class="divider" />

            <text class="section-title">十一、联系我们</text>
            <text class="body-text"> 如您对本协议有任何疑问，请联系我们： </text>
            <text class="body-text body-text--bullet"> • 客服邮箱：service@dessert-house.cn </text>
            <text class="body-text body-text--bullet"> • 客服电话：400-888-6666 </text>
            <text class="body-text body-text--bullet">
               • 在线客服：小程序内"我的"页面联系客服
            </text>

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
