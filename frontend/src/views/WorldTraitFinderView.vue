<script setup>

</script>

<template>
  <main class="container mt-5">
    <div class="mb-5">
      <h1>{{ $t('world_trait_finder.title') }}</h1>
      <i18n-t keypath="world_trait_finder.description_2" tag="p">
        <template v-slot:contribute>
          <router-link to="/contribute">{{ $t('world_trait_finder.link.contribute') }}</router-link>
        </template>
      </i18n-t>
    </div>
  </main>
</template>
