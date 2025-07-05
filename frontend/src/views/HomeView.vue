<script setup>

</script>

<template>
  <main class="container mt-5">
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('home.description_1') }}</p>
    <i18n-t keypath="home.description_2" tag="p">
      <template v-slot:contributeLink>
        <router-link to="/contribute">{{ $t('home.link.contribute') }}</router-link>
      </template>
      <template v-slot:discordLink>
        <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">{{ $t('home.link.discord') }}</a>
      </template>
      <template v-slot:githubLink>
        <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_gh">{{ $t('home.link.github') }}</a>
      </template>
    </i18n-t>

    <div class="d-flex gap-3 mt-5 flex-column flex-md-row">
      <router-link to="/map-explorer" class="btn btn-lg btn-outline-warning flex-grow-1">{{ $t('home.link_map_explorer')
        }}</router-link>
      <router-link to="/trait-finder" class="btn btn-lg btn-outline-success flex-grow-1">{{
        $t('home.link_trait_finder') }}</router-link>
    </div>
  </main>
</template>
