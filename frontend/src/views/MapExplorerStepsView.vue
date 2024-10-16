<template>
  <div class="iframe-container">
    <iframe src="https://stefan-oltmann.de/oni-seed-browser" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  name: 'IframePage',
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
  height: calc(100vh - 66px); /* not ideal, but I can't seem to work out how to get the frame to take the remaining space and ignore the navbar*/
  overflow: hidden; 
}

iframe {
  width: 100%; 
  height: 100%;
  border: none;
  overflow: auto;
}
</style>
