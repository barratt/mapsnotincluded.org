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
    <div class="map-clipping-wrapper" id="map-clipping-wrapper-1" ref="mapClippingWrapperRef"><!--
      <div class="map-container" id="map-container-1">
        <div class="map-wrapper">
          <h3>Map!</h3>
          <div class="leaflet-map" id="map"></div>
          <div class="map-footer">⚠️ Experimental Feature ⚠️</div>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores';

import "leaflet/dist/leaflet.css"
import * as L from 'leaflet';

import WebGL2Proxy from "@/components/WebGL2WebWorkerProxy";// "@/components/WebGL2.ts";
import {
  LeafletWebGL2Map
} from "@/components/LeafletWebGL2Map";
// import {initializeApp as initializeLeafletCanvasMap} from "@/components/LeafletCanvasMap";
import {LeafletMessageBrowserIframe} from "@/components/LeafletMessageBrowserIframe"
import {loadImagesAsync} from "@/components/LoadImage";

const route = useRoute();

const MAPEXPLORER_URL = import.meta.env.VITE_MAPEXPLORER_URL || 'https://stefan-oltmann.de/oni-seed-browser'; // 'http://localhost:8080/'

const iframeUrl = ref(null);
const queryParams = ref({});
const mapClippingWrapperRef = ref<HTMLDivElement | null>(null);

const iframeRef = ref<HTMLIFrameElement | null>(null);
const leafletWebGL2MapRef = ref<LeafletWebGL2Map | null>(null);
const leafletMessageBrowserIframeRef = ref<LeafletMessageBrowserIframe | null>(null);

onMounted(() => {
  console.log("Mounting!");

  queryParams.value = { ...route.query, embedded: 'mni' };

  // add token to query params if it exists
  const token = useUserStore().token;
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

  const mapClippingWrapper = mapClippingWrapperRef.value
  if (!mapClippingWrapper) {
    console.error("mapClippingWrapperRef is null");
    throw new Error("mapClippingWrapperRef is null");
  }

  // Start the map
  // initializeLeafletCanvasMap();

  // Sync the map sizes with the iframe
  const iframe = iframeRef.value;
  if (!iframe) {
    console.error("iframeRef is null");
    throw new Error("iframeRef is null");
  }
  const leafletWebGL2Map = new LeafletWebGL2Map();
  leafletWebGL2MapRef.value = leafletWebGL2Map;
  leafletMessageBrowserIframeRef.value = new LeafletMessageBrowserIframe(
      iframe,
      mapClippingWrapper,
      leafletWebGL2Map
  );
})
onBeforeUnmount(() => {
  console.log("Unmounting!");
  if (leafletWebGL2MapRef.value) {
    leafletWebGL2MapRef.value.removeAllMaps();
  }
  leafletWebGL2MapRef.value = null;
  if (leafletMessageBrowserIframeRef.value) {
    leafletMessageBrowserIframeRef.value.remove();
  }
  leafletMessageBrowserIframeRef.value = null;
});
</script>

<style scoped>
main {
  overflow: hidden;
  height: 100vh; 
}

.iframe-container {
  position: relative;
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

.map-clipping-wrapper {
  /* border: 2px dashed lime; for debugging */
  overflow: hidden;
  position: absolute;
  pointer-events: none;
}

.map-footer {
  background-color: purple;
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 4px;
  font-size: 0.9em;
  flex: 0 0 auto;
}
</style>
<style>
.map-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 15px;
  z-index: 1; /* Ensure the map is above the iframe */
  pointer-events: none; /* Allow scrolling to pass through to the iframe */
}

.leaflet-map {
  flex: 1 1 auto; /* Take remaining space */
  background-color: #fff;
}

.map-wrapper {
  border: 2px solid purple;
  background-color: purple;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;   /* Ensures children stay within rounded edge */
}
.map-header {
  background-color: purple;
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 4px;
  font-size: 0.9em;
  flex: 0 0 auto; /* Prevents header from growing */
}
.map-footer {
  background-color: purple;
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 4px;
  font-size: 0.9em;
  flex: 0 0 auto; /* Prevents footer from growing */
}
</style>