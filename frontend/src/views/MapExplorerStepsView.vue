<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const MAPEXPLORER_URL = import.meta.env.VITE_MAPEXPLORER_URL || 'http://localhost:8080/';
const iframeUrl = MAPEXPLORER_URL
const iframeRef = ref(null)

watch(locale, () => {
  if (iframeRef.value && iframeRef.value.contentWindow) {
    iframeRef.value.contentWindow.postMessage(locale.value, MAPEXPLORER_URL);
  }
});

onMounted(() => {
  if (iframeRef.value && iframeRef.value.contentWindow) {
    // TODO: Find better way of knowing when compose is ready to accept message
    setTimeout(() => {
      iframeRef.value.contentWindow.postMessage(locale.value, MAPEXPLORER_URL);
    }, 200)
  }
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
  height: calc(100vh - 68px); /* not ideal, but I can't seem to work out how to get the frame to take the remaining space and ignore the navbar*/
  overflow: hidden; 
}

iframe {
  width: 100%; 
  height: 100%;
  border: none;
  overflow: auto;
}
</style>
