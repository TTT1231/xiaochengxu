<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

import { getLeftMenuData } from './api/test';

onLaunch(async () => {
   console.log('App Launch');

   const data = await getLeftMenuData();
   console.log('查询结果:', data);
});
onShow(() => {
   console.log('App Show');
});
onHide(() => {
   console.log('App Hide');
});
</script>
<style></style>
