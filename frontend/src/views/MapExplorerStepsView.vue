<template>
  <div class="iframe-container">
    <iframe :src="iframeUrl" frameborder="0"></iframe>
  </div>
</template>

<script>
const MAPEXPLORER_URL = import.meta.env.VITE_MAPEXPLORER_URL || 'https://stefan-oltmann.de/oni-seed-browser';

export default {
  name: 'IframePage',
  data() {
    return {
      iframeUrl: MAPEXPLORER_URL,
      queryParams: {},
    }
  },
  mounted() {
    this.queryParams = this.$route.query;
    this.queryParams.embedded = 'mni'; 

    let url = MAPEXPLORER_URL;
    if (this.$route.params.seed) {
      url = `${url}#${this.$route.params.seed}`;
    }
    url = `${url}?${new URLSearchParams(this.queryParams).toString()}`;
    
    this.iframeUrl = url;
    console.log(this.iframeUrl);
  },
};
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
