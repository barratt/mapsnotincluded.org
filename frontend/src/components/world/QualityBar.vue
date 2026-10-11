<script setup>
import { computed } from 'vue'
import { geyserMean, geyserRating, ratingClass } from '@/oniCatalog'
import { int } from './format'

// min [====|=▼----] max: the marker is this geyser's average output within
// its type's range, the tick is the type's mean, and the colour is the seed
// browser rating (green at or above the mean).
const props = defineProps({
  geyser: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})

const rating = computed(() => geyserRating(props.geyser))
const span = computed(() => props.geyser.maxAvgOutput - props.geyser.minAvgOutput)
const position = computed(() =>
  span.value > 0 ? Math.min(1, Math.max(0, (props.geyser.avgOutput - props.geyser.minAvgOutput) / span.value)) : 0,
)
const meanPosition = computed(() => {
  const mean = geyserMean(props.geyser.type)
  return mean != null && span.value > 0 ? (mean - props.geyser.minAvgOutput) / span.value : null
})
</script>

<template>
  <div v-if="rating != null" class="quality" :class="[`rating-${ratingClass(rating)}`, { compact }]">
    <span class="quality-end">{{ int(geyser.minAvgOutput) }}</span>
    <span
      class="quality-track"
      role="meter"
      :aria-valuemin="geyser.minAvgOutput"
      :aria-valuemax="geyser.maxAvgOutput"
      :aria-valuenow="geyser.avgOutput"
      :aria-label="$t('world.geyser.quality_label', { pct: Math.round(rating * 100) })"
    >
      <span class="quality-fill" :style="{ width: `${position * 100}%` }"></span>
      <span v-if="meanPosition != null" class="quality-mean" :style="{ left: `${meanPosition * 100}%` }"></span>
      <span class="quality-mark" :style="{ left: `${position * 100}%` }"></span>
    </span>
    <span class="quality-end">{{ int(geyser.maxAvgOutput) }}</span>
  </div>
  <span v-else class="text-body-secondary small">{{ $t('world.geyser.no_range') }}</span>
</template>

<style scoped>
.quality {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  min-width: 9rem;
}
.quality-end {
  color: var(--sb-muted);
  font-variant-numeric: tabular-nums;
  min-width: 2.2em;
  text-align: center;
}
.quality-track {
  position: relative;
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--sb-anthracite);
  margin-top: 6px;
}
.quality-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px;
  background: var(--tone);
  opacity: 0.55;
}
.quality-mean {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  transform: translateX(-1px);
  background: rgba(255, 255, 255, 0.55);
}
.quality-mark {
  position: absolute;
  top: -9px;
  width: 0;
  height: 0;
  transform: translateX(-5px);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid var(--tone);
}
.rating-good { --tone: var(--sb-good); }
.rating-medium { --tone: var(--sb-medium); }
.rating-bad { --tone: var(--sb-bad); }
.compact { min-width: 7rem; }
</style>
