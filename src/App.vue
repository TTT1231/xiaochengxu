<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { getRightProductData } from './api/homeDataApi';

onLaunch(async () => {
   // App lifecycle: initialize global resources
   const data = await getRightProductData();
   console.log('Fetched product data on launch:', data[0]);
});
onShow(() => {
   // App visible again
});
onHide(() => {
   // App hidden/backgrounded
});
</script>
<style></style>
