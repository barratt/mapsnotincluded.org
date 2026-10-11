<script setup>
import { computed } from 'vue'
import { geyserInfo, geyserRating, ratingClass } from '@/oniCatalog'
import QualityBar from './QualityBar.vue'
import { dec1, dec2, dormancyStorage, hasTiming, int, tonsPerCycle } from './format'

// Full stats block for one geyser, used in map tooltips.
const props = defineProps({
  geyser: { type: Object, required: true },
})

const info = computed(() => geyserInfo(props.geyser.type, props.geyser.name))
const rating = computed(() => geyserRating(props.geyser))
const storage = computed(() => dormancyStorage(props.geyser))
</script>

<template>
  <div class="geyser-stats">
    <div class="d-flex align-items-center gap-2">
      <img v-if="info.icon" :src="info.icon" alt="" class="stats-icon" />
      <div class="lh-sm">
        <div class="fw-bold">{{ info.label }}</div>
        <div class="small text-body-secondary">{{ $t('world.position', { x: geyser.x, y: geyser.y }) }}</div>
      </div>
    </div>
    <div v-if="geyser.avgOutput != null" class="mt-1">
      <span class="stats-avg me-1" :class="`tone-${ratingClass(rating)}`">{{ int(geyser.avgOutput) }} g/s</span>{{ ' ' }}<span class="text-body-secondary">
        {{ $t('world.geyser.on_average') }} · {{ $t('world.geyser.tons_per_cycle', { t: dec2(tonsPerCycle(geyser.avgOutput)) }) }}
      </span>
    </div>
    <QualityBar :geyser="geyser" class="mt-1" />
    <dl v-if="hasTiming(geyser)" class="stats-list mt-1 mb-0">
      <dt>{{ $t('world.geyser.eruption') }}</dt>
      <dd>{{ $t('world.geyser.eruption_value', { rate: int(geyser.emitRate), on: int(geyser.eruptionSec), period: int(geyser.eruptionSec + geyser.idleSec) }) }}</dd>
      <dt>{{ $t('world.geyser.activity') }}</dt>
      <dd>{{ $t('world.geyser.activity_value', { on: dec1(geyser.activeCycles), period: dec1(geyser.activeCycles + geyser.dormantCycles) }) }}</dd>
      <dt>{{ $t('world.geyser.storage') }}</dt>
      <dd>{{ $t('world.geyser.storage_value', { t: dec2(storage) }) }}</dd>
    </dl>
  </div>
</template>

<style scoped>
.geyser-stats {
  min-width: 15rem;
}
.stats-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.stats-avg {
  font-size: 1.25rem;
  font-weight: bold;
}
.tone-good { color: var(--sb-good); }
.tone-medium { color: var(--sb-medium); }
.tone-bad { color: var(--sb-bad); }
.tone-none { color: var(--bs-body-color); }
.stats-list {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.6rem;
  font-size: 0.95rem;
}
.stats-list dt {
  font-weight: normal;
  color: var(--sb-muted);
}
.stats-list dd {
  margin: 0;
}
</style>
