<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

import { getLeftMenuData, getRightProductData } from './api/homeDataApi';

onLaunch(async () => {
   console.log('App Launch');

   const { data: leftData } = await getLeftMenuData();
   const rightData = await getRightProductData();

   console.log('查询结果:', { leftData, rightData });
});
onShow(() => {
   console.log('App Show');
});
onHide(() => {
   console.log('App Hide');
});
</script>
<style></style>
