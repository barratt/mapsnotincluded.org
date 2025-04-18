<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" frameborder="0" allow="clipboard-read; clipboard-write"></iframe>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores';

const route = useRoute();

const TRAITFINDER_URL = import.meta.env.VITE_TRAITFINDER_URL || 'https://sgt-imalas.github.io/TraitFinder/';

const iframeUrl = ref(null)
const iframeRef = ref(null)
const queryParams = ref({});

onMounted(() => {
  // Store current route's query param
  queryParams.value = { ...route.query, embedded: 'mni' };

  // add token to query params if it exists and is valid
  const userStore = useUserStore();

  const token = userStore.getValidToken();

  if (token) {
    queryParams.value.token = token;
  }

  // Construct iframe url from query param  
  let url = TRAITFINDER_URL;

  url = `${url}?${new URLSearchParams(queryParams.value).toString()}`;

  if (route.params.seed) {
    url = `${url}#${route.params.seed}`;
  }

  iframeUrl.value = url;
})
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
  /* not ideal, but I can't seem to work out how to get the frame to take the remaining space and ignore the navbar*/
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: auto;
}
</style>
