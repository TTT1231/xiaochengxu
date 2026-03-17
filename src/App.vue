<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';

onLaunch(() => {
   useUserStore().init();
});

onShow(() => {
   useUserStore().refreshTokenIfNeeded();
});
</script>
