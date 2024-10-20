<template>
  <div class="iframe-container">
    <button @click="sendEvent">Send Event</button>
    <iframe ref="iframeRef" :src="iframeUrl" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const MAPEXPLORER_URL = import.meta.env.VITE_MAPEXPLORER_URL || 'http://localhost:8080/';
const iframeUrl = MAPEXPLORER_URL
const iframeRef = ref(null)

function sendEvent() {
  if (iframeRef.value && iframeRef.value.contentWindow) {
    iframeRef.value.contentWindow.postMessage(locale.value, MAPEXPLORER_URL);
  }
}
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
