<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';

onLaunch(() => {
   useUserStore().init();
});

onShow(() => {
   useUserStore().refreshTokenIfNeeded();
});
</script>
