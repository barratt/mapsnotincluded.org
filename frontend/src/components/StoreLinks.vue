<script setup>
// "Get it" links for the game and DLCs. With `products` it lists what a
// world needs (compact on result cards); without, every product the store
// has a link for (the home page strip). Shows nothing unless switched on.
import { computed } from 'vue'
import { site, storeLink, trackStoreClick } from '@/siteConfig'

const props = defineProps({
  products: { type: Array, default: null },
  compact: { type: Boolean, default: false },
})

const ALL = ['BaseGame', 'SpacedOut', 'FrostyPlanet', 'PrehistoricPlanet', 'AquaticPlanet', 'BionicBooster']
const affiliate = computed(() => site.config.affiliate ?? null)
const items = computed(() => {
  if (!affiliate.value) return []
  if (props.products && !affiliate.value.onWorlds) return []
  return (props.products ?? ALL).filter((p) => storeLink(p)).map((p) => ({ id: p, url: storeLink(p) }))
})
</script>

<template>
  <div v-if="items.length" class="store-links" :class="{ compact }">
    <template v-if="compact">
      <i class="bi bi-bag me-1" aria-hidden="true"></i>
      <span class="me-1">{{ $t('store.needs') }}</span>
      <a
        v-for="(item, i) in items"
        :key="item.id"
        :href="item.url"
        target="_blank"
        rel="sponsored noopener"
        :title="affiliate.disclosure"
        @click="trackStoreClick(item.id)"
        >{{ $t(`store.products.${item.id}`) }}{{ i < items.length - 1 ? ',' : '' }}</a
      >
    </template>
    <template v-else>
      <div class="store-title">{{ products ? $t('store.to_play') : $t('store.get_game') }}</div>
      <div class="d-flex flex-wrap gap-2">
        <a
          v-for="item in items"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="sponsored noopener"
          class="btn btn-sm btn-outline-warning"
          @click="trackStoreClick(item.id)"
        >
          <i class="bi bi-bag me-1" aria-hidden="true"></i>{{ $t(`store.products.${item.id}`) }}
          <span v-if="affiliate.storeName" class="store-on">{{ $t('store.on', { store: affiliate.storeName }) }}</span>
        </a>
      </div>
      <div class="store-disclosure">{{ affiliate.disclosure }}</div>
    </template>
  </div>
</template>

<style scoped>
.store-links.compact {
  font-size: 0.78rem;
  color: var(--bs-secondary-color);
  margin-top: 0.35rem;
}
.store-links.compact a {
  color: var(--bs-warning-text-emphasis, #e0a800);
  margin-right: 0.3rem;
  text-decoration: none;
}
.store-links.compact a:hover {
  text-decoration: underline;
}
.store-title {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: var(--bs-secondary-color);
}
.store-on {
  opacity: 0.75;
  margin-left: 0.25rem;
}
.store-disclosure {
  font-size: 0.72rem;
  color: var(--bs-secondary-color);
  margin-top: 0.35rem;
}
</style>
