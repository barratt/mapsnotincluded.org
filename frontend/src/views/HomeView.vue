<script setup>

</script>

<template>
  <main class="container mt-5">
    <h1>Welcome to MapsNotIncluded!</h1>
    <p>
      This website is currently a work in progress, and will eventually contain a variety of tools and resources for Oxygen Not Included. Our map explorer is already live, and with your contributions, we'll be adding even more useful features soon.
    </p>
    <p>
      Want to get involved? Head over to our <router-link to="/contribute">Contribute</router-link> page. You can also join our community on <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">Discord</a> or submit issues and pull requests via <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_gh">GitHub</a>!
    </p>

    <div class="d-flex gap-3 mt-5 flex-column flex-md-row">
      <router-link to="/map-explorer" class="btn btn-lg btn-outline-warning flex-grow-1">Map Explorer</router-link>
      <!--<router-link to="/seed-viewer" class="btn btn-lg btn-outline-primary flex-grow-1">Seed Viewer</router-link>-->
      <router-link to="/trait-finder" class="btn btn-lg btn-outline-success flex-grow-1">World Trait Finder</router-link>
      <router-link to="/starmap-generator" class="btn btn-lg btn-outline-info flex-grow-1">Star Map Generator</router-link>
    </div>
  </main>
</template>
