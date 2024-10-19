<script setup>

</script>

<template>
  <main class="container mt-5">
    <h1>{{ $t('starmap_generator.title') }}</h1>
    <p>{{ $t('starmap_generator.description_1') }}</p>
    <br/>
    <i18n-t keypath="starmap_generator.description_2" tag="p">
      <template v-slot:contribute>
        <router-link to="/contribute">{{ $t('starmap_generator.link.contribute') }}</router-link>
      </template>
    </i18n-t>
  </main>
</template>
