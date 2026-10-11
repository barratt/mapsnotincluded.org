<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { asteroidInfo, traitInfo, ratingClass } from '@/oniCatalog'
import GeyserBadge from '@/components/world/GeyserBadge.vue'
import { groupGeysers, shortOutput } from '@/components/geyserGroups'

// Compact search result: start asteroid, its traits as icons, and geysers
// grouped by type (icon + count + best output). For multi-asteroid clusters
// a second row sums up the rest of the cluster.
const props = defineProps({
  world: { type: Object, required: true },
  // { geysers: [{ type, scope }], traits: [id] } from the search response
  highlight: { type: Object, default: null },
})

const { t } = useI18n()

const CLUSTER_ROW_LIMIT = 10

const start = computed(() => props.world.asteroids.find((a) => a.start) ?? props.world.asteroids[0])
const others = computed(() => props.world.asteroids.filter((a) => a !== start.value))
const startInfo = computed(() => asteroidInfo(start.value.id))

const highlightStart = computed(() => new Set((props.highlight?.geysers ?? []).filter((g) => g.scope === 'start').map((g) => g.type)))
const highlightCluster = computed(() => new Set((props.highlight?.geysers ?? []).filter((g) => g.scope !== 'start').map((g) => g.type)))
const highlightTraits = computed(() => new Set(props.highlight?.traits ?? []))

const traits = computed(() =>
  start.value.traits
    .map((trait) => {
      const info = traitInfo(trait)
      return { ...info, highlighted: highlightTraits.value.has(info.id) }
    })
    .sort((a, b) => Number(b.highlighted) - Number(a.highlighted)),
)

const startGroups = computed(() => groupGeysers(start.value.geysers, new Set([...highlightStart.value, ...highlightCluster.value])))

const clusterGeysers = computed(() => others.value.flatMap((a) => a.geysers))
const clusterGroups = computed(() => groupGeysers(clusterGeysers.value, highlightCluster.value))
const clusterShown = computed(() => clusterGroups.value.slice(0, CLUSTER_ROW_LIMIT))
const clusterHidden = computed(() => clusterGroups.value.length - clusterShown.value.length)

function groupTitle(group) {
  const outputs = group.outputs.map((o) => `${o} g/s`).join(', ')
  return `${group.label} ×${group.count} · ${outputs}`
}

// Touch screens have no hover: tapping a geyser chip shows its name and
// every output under the row.
const selected = ref(null)
function toggle(row, group) {
  selected.value = selected.value?.row === row && selected.value.group.type === group.type ? null : { row, group }
}
function caption(group) {
  return `${group.label} ×${group.count} · ${group.outputs.map((o) => `${o}`).join(', ')} g/s`
}

const copied = ref(false)
async function copyCoordinate() {
  try {
    await navigator.clipboard?.writeText(props.world.coordinate)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard blocked: the coordinate is still selectable.
  }
}
</script>

<template>
  <article class="world-card h-100">
    <header class="d-flex align-items-center gap-2">
      <img v-if="startInfo.icon" :src="startInfo.icon" alt="" class="world-card-asteroid" loading="lazy" />
      <div class="min-w-0 flex-grow-1">
        <div class="d-flex align-items-center gap-1 flex-wrap">
          <h3 class="world-card-title mb-0">{{ world.clusterName }}</h3>
          <span v-if="world.synthetic" class="badge text-bg-dark">{{ $t('world.synthetic') }}</span>
          <span v-if="world.match" class="badge text-bg-warning">
            {{ $t('home.search.match_short', { satisfied: world.match.satisfied, total: world.match.total }) }}
          </span>
        </div>
        <button type="button" class="world-card-coordinate" :title="$t('home.search.copy')" @click="copyCoordinate">
          <span class="text-truncate">{{ world.coordinate }}</span>
          <i class="bi" :class="copied ? 'bi-check2 text-success' : 'bi-copy'" aria-hidden="true"></i>
          <span class="visually-hidden">{{ copied ? $t('home.search.copied') : $t('home.search.copy') }}</span>
        </button>
      </div>
    </header>

    <div v-if="traits.length" class="world-card-traits" :aria-label="$t('home.search.traits')">
      <span
        v-for="trait in traits"
        :key="trait.id"
        class="world-card-trait"
        :class="{ highlighted: trait.highlighted }"
        :title="trait.description ? `${trait.label}: ${trait.description}` : trait.label"
      >
        <img v-if="trait.icon" :src="trait.icon" alt="" loading="lazy" />
        <span class="world-card-trait-label">{{ trait.label }}</span>
      </span>
    </div>

    <section class="world-card-row">
      <h4 class="world-card-row-title">
        {{ $t('home.search.start_asteroid') }}
        <span class="text-body-secondary">· {{ start.geysers.length }}</span>
      </h4>
      <ul class="world-card-geysers">
        <li v-for="group in startGroups" :key="group.type">
          <button
            type="button"
            class="world-card-geyser"
            :class="{ highlighted: group.highlighted, selected: selected?.row === 'start' && selected.group.type === group.type }"
            :title="groupTitle(group)"
            :aria-label="groupTitle(group)"
            @click="toggle('start', group)"
          >
            <GeyserBadge :icon="group.icon" :rating="group.rating" :count="group.count" :label="group.label" :size="34" />
            <span class="world-card-output" :class="`tone-${ratingClass(group.rating)}`">{{ shortOutput(group.best.avgOutput) }}</span>
          </button>
        </li>
        <li v-if="!startGroups.length" class="text-body-secondary small">{{ $t('home.search.no_geysers') }}</li>
      </ul>
      <div v-if="selected?.row === 'start'" class="world-card-caption">{{ caption(selected.group) }}</div>
    </section>

    <section v-if="others.length" class="world-card-row">
      <h4 class="world-card-row-title">
        {{ $t('home.search.rest_of_cluster', { n: others.length }) }}
        <span class="text-body-secondary">· {{ clusterGeysers.length }}</span>
      </h4>
      <ul class="world-card-geysers">
        <li v-for="group in clusterShown" :key="group.type">
          <button
            type="button"
            class="world-card-geyser"
            :class="{ highlighted: group.highlighted, selected: selected?.row === 'cluster' && selected.group.type === group.type }"
            :title="groupTitle(group)"
            :aria-label="groupTitle(group)"
            @click="toggle('cluster', group)"
          >
            <GeyserBadge :icon="group.icon" :rating="group.rating" :count="group.count" :label="group.label" :size="28" />
            <span class="world-card-output" :class="`tone-${ratingClass(group.rating)}`">{{ shortOutput(group.best.avgOutput) }}</span>
          </button>
        </li>
        <li v-if="clusterHidden > 0" class="world-card-more">+{{ clusterHidden }}</li>
      </ul>
      <div v-if="selected?.row === 'cluster'" class="world-card-caption">{{ caption(selected.group) }}</div>
    </section>

    <footer class="world-card-actions">
      <router-link :to="`/world/${world.coordinate}`" class="btn btn-sm btn-warning flex-grow-1">
        {{ $t('home.search.view') }} <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </router-link>
      <router-link
        :to="`/map-explorer/${world.coordinate}`"
        class="btn btn-sm btn-outline-secondary"
        :title="t('world.map_explorer')"
        :aria-label="t('world.map_explorer')"
      >
        <i class="bi bi-map" aria-hidden="true"></i>
      </router-link>
    </footer>
  </article>
</template>

<style scoped>
.world-card {
  --sb-anthracite: #222529;
  --sb-chip: #545454;
  --sb-good: #4cee4c;
  --sb-medium: #ffee58;
  --sb-bad: #ffa192;
  --sb-good-ring: rgba(0, 255, 0, 0.65);
  --sb-medium-ring: rgba(255, 255, 0, 0.65);
  --sb-bad-ring: rgba(255, 161, 146, 0.65);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  background: var(--bs-tertiary-bg);
}
.min-w-0 {
  min-width: 0;
}
.world-card-asteroid {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex: none;
}
.world-card-title {
  font-size: 1.2rem;
}
.world-card-coordinate {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  color: var(--bs-secondary-color);
  font-family: var(--bs-font-monospace);
  font-size: 0.8rem;
}
.world-card-coordinate:hover {
  color: var(--bs-body-color);
}
.world-card-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.world-card-trait {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.45rem 0.1rem 0.15rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.8rem;
}
.world-card-trait img {
  width: 20px;
  height: 20px;
}
.world-card-trait.highlighted {
  border-color: var(--bs-warning);
}
.world-card-row-title {
  margin: 0 0 0.3rem;
  font-size: 0.75rem;
  font-weight: normal;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
}
.world-card-geysers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.world-card-geyser {
  color: inherit;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  min-width: 2.4rem;
  padding: 0.15rem;
  border: 1px solid transparent;
  border-radius: 8px;
}
.world-card-geyser.highlighted {
  border-color: var(--bs-warning);
  background: rgba(255, 193, 7, 0.08);
}
.world-card-geyser.selected {
  border-color: var(--bs-secondary-color);
}
.world-card-caption {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}
.world-card-output {
  font-size: 0.72rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.tone-good { color: var(--sb-good); }
.tone-medium { color: var(--sb-medium); }
.tone-bad { color: var(--sb-bad); }
.tone-none { color: var(--bs-secondary-color); }
.world-card-more {
  align-self: center;
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}
.world-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}
.world-card-actions .btn {
  min-height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
</style>
