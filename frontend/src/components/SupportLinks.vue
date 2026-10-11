<script setup>
// Ways to help pay for the site (Ko-fi, Patreon, ...). Shows nothing unless
// switched on.
import { computed } from 'vue'
import { site } from '@/siteConfig'

const support = computed(() => site.config.support ?? null)
</script>

<template>
  <div v-if="support" class="support-links text-center">
    <span class="me-2">{{ support.message }}</span>
    <a
      v-for="link in support.links"
      :key="link.url"
      :href="link.url"
      target="_blank"
      rel="noopener"
      class="btn btn-sm btn-outline-secondary me-1 mb-1"
    >
      <i class="bi bi-heart me-1" aria-hidden="true"></i>{{ link.label }}
    </a>
  </div>
</template>

<style scoped>
.support-links {
  font-size: 0.85rem;
  color: var(--bs-secondary-color);
  margin-top: 1rem;
}
</style>
