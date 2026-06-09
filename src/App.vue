<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { useEnvConfig } from '@/hooks/useEnvConfig';

const { cloudEnvId } = useEnvConfig();

onLaunch(async () => {
   try {
      wx.cloud.init({ env: cloudEnvId });
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

<style lang="scss">
page {
   background: $bg-page;
   color: $text-primary;
   font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>
