<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { getRightProductData } from './api/homeDataApi';

onLaunch(async () => {
   // App lifecycle: initialize global resources
   await getRightProductData();
});
onShow(() => {
   // App visible again
});
onHide(() => {
   // App hidden/backgrounded
});
</script>
<style></style>
