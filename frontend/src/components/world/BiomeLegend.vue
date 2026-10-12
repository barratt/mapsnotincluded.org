<script setup>
import { computed } from 'vue'
import { polygonArea, zoneInfo } from '@/oniCatalog'

// Biomes present on the asteroid with their share of the map. Clicking one
// highlights it on the map (like the seed browser's biome details panel).
const props = defineProps({
  asteroid: { type: Object, required: true },
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])

const rows = computed(() => {
  const total = (props.asteroid.sizeX || 1) * (props.asteroid.sizeY || 1)
  const byZone = new Map()
  for (const biome of props.asteroid.biomes ?? []) {
    const info = zoneInfo(biome.zone)
    const area = (biome.polygons ?? []).reduce((sum, poly) => sum + polygonArea(poly), 0)
    const row = byZone.get(info.id) ?? { ...info, name: biome.name || info.label, area: 0 }
    row.area += area
    byZone.set(info.id, row)
  }
  return [...byZone.values()]
    .map((row) => ({ ...row, share: row.area / total }))
    .sort((a, b) => b.area - a.area)
})

function toggle(zone) {
  emit('update:modelValue', props.modelValue === zone ? null : zone)
}
</script>

<template>
  <ul v-if="rows.length" class="biome-legend list-unstyled mb-0">
    <li v-for="row in rows" :key="row.id">
      <button
        type="button"
        class="biome-row"
        :class="{ active: modelValue === row.id }"
        :aria-pressed="modelValue === row.id"
        @click="toggle(row.id)"
      >
        <img v-if="row.icon" :src="row.icon" alt="" class="biome-icon" loading="lazy" />
        <span class="biome-swatch" :style="{ background: row.color }" aria-hidden="true"></span>
        <span class="biome-name">{{ row.name }}</span>
        <span class="biome-share">{{ Math.round(row.share * 100) }}%</span>
      </button>
    </li>
  </ul>
  <p v-else class="text-body-secondary mb-0">{{ $t('world.map.no_biomes') }}</p>
</template>

<style scoped>
.biome-legend {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 0.4rem;
}
.biome-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.25rem 0.5rem 0.25rem 0.3rem;
  border: 1px solid var(--sb-border);
  border-radius: 6px;
  background: var(--sb-card);
  color: inherit;
  text-align: left;
  overflow: hidden;
}
.biome-row:hover {
  border-color: var(--bs-body-color);
}
.biome-row.active {
  border-color: var(--sb-hover);
  box-shadow: 0 0 0 1px var(--sb-hover);
}
.biome-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.6),
    0 0 0 2px rgba(255, 255, 255, 0.35);
  flex: none;
}
.biome-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  flex: none;
}
.biome-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.biome-share {
  color: var(--sb-muted);
  font-variant-numeric: tabular-nums;
}
</style>
