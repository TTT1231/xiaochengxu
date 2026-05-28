<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';

onLaunch(async () => {
   try {
      wx.cloud.init({ env: 'YOUR_WEIXIN_CLOUD_ID' });
   } catch (error) {
      uni.showModal({
         title: '初始化失败',
         content: '云开发环境初始化失败，请重新打开小程序',
         showCancel: false,
      });
      return;
   }
   await useUserStore().init();
});
</script>
