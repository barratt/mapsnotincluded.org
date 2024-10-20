<script setup>

</script>

<template>
  <main>
    <h1>{{ $t('not_found.title') }}</h1>
    <p>{{ $t('not_found.description_1') }}</p>
    <i18n-t keypath="not_found.description_2" tag="p">
      <template v-slot:githubLink>
        <a href="https://github.com/barratt/mapsnotincluded.org" target="_blank">GitHub</a>
      </template>
      <template v-slot:discordLink>
        <a href="https://discord.gg/3vhCpp6PNq" target="_blank">Discord</a>
      </template>
    </i18n-t>
  </main>
</template>
