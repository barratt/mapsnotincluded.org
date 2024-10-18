<script setup>

</script>

<template>
  <main class="container mt-5">
    <h1>Welcome</h1>
    <p>
      Welcome to MapsNotIncluded! This website is a work in progress, and will eventually contain a variety of map / world generation tools and resources for Oxygen Not Included.
    </p>
    <p>
      If you would like to send us world-saves to index, head over to <router-link to="/contribute">contribute</router-link>, otherwise please consider joining our <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">Discord</a>, or submit an issue / PR on <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_gh">GitHub</a>!
    </p>

    <div class="d-flex gap-3 mt-5 flex-column flex-md-row">
      <router-link to="/map-explorer" class="btn btn-lg btn-outline-warning flex-grow-1">Map Explorer</router-link>
      <!--<router-link to="/seed-explorer" class="btn btn-lg btn-outline-primary flex-grow-1">Seed Explorer</router-link>-->
      <router-link to="/trait-finder" class="btn btn-lg btn-outline-success flex-grow-1">World Trait Finder</router-link>
      <router-link to="/starmap-generator" class="btn btn-lg btn-outline-info flex-grow-1">Star Map Generator</router-link>
    </div>
  </main>
</template>
