<!--
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
-->

<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" frameborder="0" allow="clipboard-read; clipboard-write; cross-origin-isolated"></iframe>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores';

const route = useRoute();

const MAPEXPLORER_URL = import.meta.env.VITE_MAPEXPLORER_URL || 'https://mapsnotincluded.github.io/oni-seed-browser'; // 'http://localhost:8080/'

const iframeUrl = ref(null)
const iframeRef = ref(null)
const queryParams = ref({});

onMounted(() => {

  queryParams.value = { ...route.query, embedded: 'mni' };

  // add token to query params if it exists and is valid
  const userStore = useUserStore()

  const token = userStore.getValidToken();

  if (token) {
    queryParams.value.token = token;
  }

  // Construct iframe url from query param  
  let url = MAPEXPLORER_URL;

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
  height: calc(100vh - 69px); /* not ideal, but I can't seem to work out how to get the frame to take the remaining space and ignore the navbar*/
  overflow: hidden; 
}

iframe {
  width: 100%; 
  height: 100%;
  border: none;
  overflow: auto;
}
</style>
