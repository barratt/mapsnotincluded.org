<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" frameborder="0" allow="clipboard-read; clipboard-write"></iframe>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useUserStore} from '@/stores';

const route = useRoute();

const MAPEXPLORER_URL = 'https://stefan-oltmann/oni-seed-browser';

const iframeUrl = ref(null)
const iframeRef = ref(null)

onMounted(() => {
  const userStore = useUserStore()
  const token = userStore.getValidToken();

  // Merge query parameters from URL
  const queryParams = {...route.query, embedded: 'mni'};

  // Add token if available
  if (token) queryParams.token = token;

  // Encode query parameters safely
  const encodedQuery = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

  // Build final URL
  let url = `${MAPEXPLORER_URL}?${encodedQuery}`;

  // Add seed fragment if present
  if (route.params.seed)
    url += `#${route.params.seed}`;

  iframeUrl.value = url;
});
</script>

<style scoped>
main {
  overflow: hidden;
  height: 100vh;
}

.iframe-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 69px);
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: auto;
}
</style>
