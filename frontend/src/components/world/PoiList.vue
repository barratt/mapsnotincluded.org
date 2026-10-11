<script setup>
import { computed } from 'vue'
import { poiInfo } from '@/oniCatalog'

// Points of interest grouped by type; each location selects its map marker.
const props = defineProps({
  pois: { type: Array, default: () => [] },
  selected: { type: String, default: null },
})
const emit = defineEmits(['update:selected'])

const groups = computed(() => {
  const map = new Map()
  props.pois.forEach((poi, i) => {
    const info = poiInfo(poi.type, poi.name)
    const group = map.get(info.id) ?? { ...info, items: [] }
    group.items.push({ key: `p${i}`, poi })
    map.set(info.id, group)
  })
  return [...map.values()].sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label))
})

function select(key) {
  emit('update:selected', props.selected === key ? null : key)
}
</script>

<template>
  <p v-if="!pois.length" class="text-body-secondary mb-0">{{ $t('world.poi.none') }}</p>
  <ul v-else class="poi-list list-unstyled mb-0">
    <li v-for="group in groups" :key="group.id" class="poi-group">
      <span class="poi-icon">
        <img v-if="group.icon" :src="group.icon" alt="" loading="lazy" />
        <i v-else class="bi bi-geo-alt-fill" aria-hidden="true"></i>
      </span>
      <div class="flex-grow-1 min-w-0">
        <div>
          {{ group.label }}
          <span v-if="group.items.length > 1" class="text-body-secondary">×{{ group.items.length }}</span>
        </div>
        <div class="d-flex flex-wrap gap-1 mt-1">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="poi-coord"
            :class="{ selected: selected === item.key }"
            :aria-pressed="selected === item.key"
            :aria-label="$t('world.poi.show', { name: group.label, x: item.poi.x, y: item.poi.y })"
            @click="select(item.key)"
          >
            {{ item.poi.x }}, {{ item.poi.y }}
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.poi-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.5rem;
}
.poi-group {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--sb-border);
  border-radius: 8px;
  background: var(--sb-card);
  font-size: 1.1rem;
}
.min-w-0 {
  min-width: 0;
}
.poi-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  background: var(--sb-chip);
  border: 1px solid var(--sb-anthracite);
}
.poi-icon img {
  width: 72%;
  height: 72%;
  object-fit: contain;
}
.poi-coord {
  padding: 0 0.4rem;
  border: 1px solid var(--sb-border);
  border-radius: 4px;
  background: transparent;
  color: var(--sb-muted);
  font-family: var(--bs-font-monospace);
  font-size: 0.8rem;
}
.poi-coord:hover,
.poi-coord.selected {
  color: var(--sb-hover);
  border-color: var(--sb-hover);
}
</style>
