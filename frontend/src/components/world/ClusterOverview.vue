<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { asteroidInfo, geyserInfo, geyserRating, poiInfo, traitInfo } from '@/oniCatalog'
import GeyserBadge from './GeyserBadge.vue'
import { int } from './format'

// Asteroid cards in the style of the seed browser's cluster rows; also the
// asteroid selector for the rest of the page.
const props = defineProps({
  asteroids: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const UNRATED = new Set(['oilwell', 'tidal_spring', 'thermal_gas_fissure'])

const cards = computed(() =>
  props.asteroids.map((asteroid, index) => {
    const geysers = []
    const grouped = new Map()
    for (const g of asteroid.geysers ?? []) {
      const info = geyserInfo(g.type, g.name)
      const tip = g.avgOutput != null ? `${info.label} · ${int(g.avgOutput)} g/s` : info.label
      if (UNRATED.has(info.id)) {
        const entry = grouped.get(info.id) ?? { key: info.id, icon: info.icon, label: info.label, tip: info.label, rating: null, count: 0 }
        entry.count++
        grouped.set(info.id, entry)
      } else {
        geysers.push({ key: geysers.length, icon: info.icon, label: info.label, tip, rating: geyserRating(g), count: 1, sort: info.id })
      }
    }
    geysers.sort((a, b) => a.sort.localeCompare(b.sort))
    const pois = new Map()
    for (const p of asteroid.pois ?? []) {
      const info = poiInfo(p.type, p.name)
      const entry = pois.get(info.id) ?? { ...info, count: 0 }
      entry.count++
      pois.set(info.id, entry)
    }
    return {
      index,
      asteroid,
      info: asteroidInfo(asteroid.id, asteroid.name),
      traits: (asteroid.traits ?? []).map(traitInfo),
      geysers: [...geysers, ...grouped.values()],
      pois: [...pois.values()],
    }
  }),
)

function cardLabel(card) {
  const parts = [card.info.label]
  if (card.asteroid.start) parts.push(t('world.start'))
  parts.push(t('world.geyser_count', { n: card.asteroid.geysers?.length ?? 0 }))
  return parts.join(', ')
}
</script>

<template>
  <div class="cluster-cards">
    <button
      v-for="card in cards"
      :key="card.index"
      type="button"
      class="asteroid-card"
      :class="{ selected: modelValue === card.index, start: card.asteroid.start }"
      :aria-pressed="modelValue === card.index"
      :aria-label="cardLabel(card)"
      @click="emit('update:modelValue', card.index)"
    >
      <span class="asteroid-thumb">
        <img v-if="card.info.icon" :src="card.info.icon" alt="" loading="lazy" />
        <i v-else class="bi bi-globe2" aria-hidden="true"></i>
      </span>
      <span class="asteroid-body">
        <span class="asteroid-head">
          <span class="asteroid-name">{{ card.info.label }}</span>
          <span v-if="card.asteroid.start" class="badge sb-start-badge">{{ $t('world.start') }}</span>
          <span v-if="card.asteroid.sizeX" class="asteroid-size">{{ card.asteroid.sizeX }}×{{ card.asteroid.sizeY }}</span>
          <span class="asteroid-traits">
            <span v-for="trait in card.traits" :key="trait.id" class="trait-chip" :title="trait.label" :style="{ '--trait': trait.color }">
              <img v-if="trait.icon" :src="trait.icon" :alt="trait.label" loading="lazy" />
              <span v-else>{{ trait.label }}</span>
            </span>
          </span>
        </span>
        <span v-if="card.geysers.length" class="badge-row">
          <span v-for="g in card.geysers" :key="g.key" :title="g.tip">
            <GeyserBadge :icon="g.icon" :rating="g.rating" :count="g.count" :label="g.label" :size="34" />
          </span>
        </span>
        <span v-else class="asteroid-empty">{{ $t('world.geyser.none') }}</span>
        <span v-if="card.pois.length" class="badge-row">
          <span v-for="p in card.pois" :key="p.id" :title="p.label">
            <GeyserBadge :icon="p.icon" :count="p.count" :label="p.label" :size="34" />
          </span>
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.cluster-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 30rem), 1fr));
  gap: 0.5rem;
}
.asteroid-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--sb-card);
  color: inherit;
  text-align: left;
}
.asteroid-card.start {
  border-color: var(--sb-border);
}
.asteroid-card:hover {
  border-color: var(--bs-body-color);
}
.asteroid-card.selected {
  border-color: var(--sb-hover);
  box-shadow: 0 0 0 1px var(--sb-hover);
}
.asteroid-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  flex: none;
  border-radius: 8px;
  background: #000;
  font-size: 2rem;
}
.asteroid-thumb img {
  width: 88%;
  height: 88%;
  object-fit: contain;
}
.asteroid-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  flex: 1;
}
.asteroid-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  line-height: 1.2;
}
.asteroid-name {
  font-size: 1.25rem;
}
.asteroid-size {
  font-size: 0.95rem;
  color: var(--sb-muted);
}
.asteroid-traits {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 3px;
}
.trait-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 2px;
  border-radius: 4px;
  background: rgba(34, 37, 41, 0.7);
  border-bottom: 2px solid var(--trait);
  font-size: 0.8rem;
}
.trait-chip img {
  width: 18px;
  height: 18px;
}
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.asteroid-empty {
  color: var(--sb-muted);
  font-size: 1rem;
}
@media (max-width: 575.98px) {
  .asteroid-thumb {
    width: 56px;
    height: 56px;
  }
  .badge-row :deep(.geyser-badge) {
    width: 30px;
    height: 30px;
  }
}
</style>
