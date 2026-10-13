<script setup>
import { computed } from 'vue'
import { geyserInfo, geyserRating } from '@/oniCatalog'
import GeyserBadge from './GeyserBadge.vue'
import { dec2, int, tonsPerCycle } from './format'

// Compact geyser list beside the map, best output first. Clicking one
// selects it on the map (the same keys as the map's markers and the table).
const props = defineProps({
  geysers: { type: Array, default: () => [] },
  selected: { type: String, default: null },
})
const emit = defineEmits(['update:selected'])

const rows = computed(() =>
  props.geysers
    .map((g, i) => {
      const info = geyserInfo(g.type, g.name)
      return { key: `g${i}`, g, label: info.label, icon: info.icon, rating: geyserRating(g) }
    })
    .sort((a, b) => (b.g.avgOutput ?? -1) - (a.g.avgOutput ?? -1) || a.label.localeCompare(b.label)),
)

const select = (row) => emit('update:selected', props.selected === row.key ? null : row.key)
</script>

<template>
  <p v-if="!geysers.length" class="text-body-secondary mb-0">{{ $t('world.geyser.none') }}</p>
  <ul v-else class="geyser-list list-unstyled mb-0">
    <li v-for="row in rows" :key="row.key">
      <button type="button" class="geyser-row" :class="{ selected: selected === row.key }" :aria-pressed="selected === row.key" @click="select(row)">
        <GeyserBadge :icon="row.icon" :rating="row.rating" :size="32" />
        <span class="flex-grow-1 lh-sm text-start">
          <span class="d-block">{{ row.label }}</span>
          <span class="small text-body-secondary">{{ $t('world.geyser.tons_per_cycle', { t: dec2(tonsPerCycle(row.g.avgOutput)) }) }}</span>
        </span>
        <span class="fw-bold text-nowrap">{{ int(row.g.avgOutput) }} g/s</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.geyser-list {
  max-height: 420px;
  overflow-y: auto;
  display: grid;
  gap: 2px;
}
.geyser-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.3rem 0.4rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  color: inherit;
}
.geyser-row:hover {
  background: rgba(255, 255, 255, 0.05);
}
.geyser-row.selected {
  border-color: var(--bs-warning);
  background: rgba(var(--bs-warning-rgb), 0.1);
}
</style>
