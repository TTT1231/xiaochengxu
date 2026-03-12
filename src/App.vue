<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';

onLaunch(() => {
   // 初始化用户状态，登录等
   useUserStore().init();
});

onShow(() => {
   useUserStore().refreshTokenIfNeeded();
});

onHide(() => {});
</script>
<style></style>
