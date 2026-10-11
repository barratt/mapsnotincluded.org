<script setup>
import { api } from '@/searchApi'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { asteroidInfo, geyserInfo, geyserRating, traitInfo, ratingClass } from '@/oniCatalog'
import GeyserBadge from '@/components/world/GeyserBadge.vue'
import { groupGeysers, shortOutput } from '@/components/geyserGroups'

// Compact search result: start asteroid, its traits as icons, and geysers
// grouped by type (icon + count + best output). For multi-asteroid clusters
// a second row sums up the rest of the cluster.
//
// What the search asked for is outlined: green where this world meets the
// condition, red where it doesn't. Close matches (world.match.conditions)
// also show faded chips for the geysers and traits they are missing.
const props = defineProps({
  world: { type: Object, required: true },
  // { geysers: [{ type, scope }], excludedGeysers, traits, quality } from the search response
  highlight: { type: Object, default: null },
  // The search this card came from and its place in the list, for the
  // "opened from a search" statistics.
  searchId: { type: String, default: null },
  rank: { type: Number, default: null },
})

function opened() {
  if (!props.searchId) return
  api('/events', { method: 'POST', body: { type: 'open_world', searchId: props.searchId, coordinate: props.world.coordinate, rank: props.rank } }).catch(() => {})
}

const { t } = useI18n()

const CLUSTER_ROW_LIMIT = 10

const start = computed(() => props.world.asteroids.find((a) => a.start) ?? props.world.asteroids[0])
const others = computed(() => props.world.asteroids.filter((a) => a !== start.value))
const startInfo = computed(() => asteroidInfo(start.value.id))

// Per-condition results for close matches; full matches meet everything.
const conditions = computed(() => props.world.match?.conditions ?? null)
const geyserConditions = computed(() => (conditions.value ?? []).filter((c) => c.kind === 'geyser'))

// Status of a geyser type in a row: 'met', 'unmet' or null (not asked for).
function geyserStatus(type, row) {
  if (conditions.value) {
    const relevant = geyserConditions.value.filter((c) => c.type === type && (row === 'start' || c.scope === 'cluster'))
    if (!relevant.length) return null
    return relevant.every((c) => c.ok) ? 'met' : 'unmet'
  }
  const h = props.highlight
  if (!h) return null
  if ((h.excludedGeysers ?? []).includes(type)) return 'unmet'
  return (h.geysers ?? []).some((g) => g.type === type && (row === 'start' || g.scope !== 'start')) ? 'met' : null
}

// Geysers a close match lacks: shown faded in the row they were wanted in.
function missingIn(row) {
  const multi = others.value.length > 0
  return geyserConditions.value
    .filter((c) => !c.ok && c.count < c.min)
    .filter((c) => (c.scope === 'start' ? row === 'start' : row === (multi ? 'cluster' : 'start')))
    .map((c) => ({ ...c, info: geyserInfo(c.type) }))
}

const traits = computed(() => {
  const wanted = new Set(props.highlight?.traits ?? [])
  const traitConditions = (conditions.value ?? []).filter((c) => c.kind === 'trait')
  const shown = start.value.traits.map((trait) => {
    const info = traitInfo(trait)
    const cond = traitConditions.find((c) => c.trait === info.id)
    const status = cond ? (cond.ok ? 'met' : 'unmet') : wanted.has(info.id) ? 'met' : null
    return { ...info, status }
  })
  const missing = traitConditions
    .filter((c) => !c.ok && c.want && !shown.some((s) => s.id === c.trait))
    .map((c) => ({ ...traitInfo(c.trait), status: 'missing' }))
  return [...shown, ...missing].sort((a, b) => Number(Boolean(b.status)) - Number(Boolean(a.status)))
})

const startGroups = computed(() =>
  groupGeysers(start.value.geysers, new Set()).map((g) => ({ ...g, status: geyserStatus(g.type, 'start') })).sort(byStatus),
)
const clusterGeysers = computed(() => others.value.flatMap((a) => a.geysers))
const clusterGroups = computed(() =>
  groupGeysers(clusterGeysers.value, new Set()).map((g) => ({ ...g, status: geyserStatus(g.type, 'cluster') })).sort(byStatus),
)
const clusterShown = computed(() => clusterGroups.value.slice(0, CLUSTER_ROW_LIMIT))
const clusterHidden = computed(() => clusterGroups.value.length - clusterShown.value.length)

// Searched-for types first (met before unmet), then by combined output.
function byStatus(a, b) {
  const rank = (g) => (g.status === 'met' ? 2 : g.status ? 1 : 0)
  return rank(b) - rank(a) || b.weight - a.weight
}

// "Geysers above average" requests: the share this world actually has.
const quality = computed(() => {
  const fromMatch = (conditions.value ?? []).find((c) => c.kind === 'quality')
  const q = props.highlight?.quality
  if (!q && !fromMatch) return null
  const scope = q?.scope ?? fromMatch?.scope ?? 'cluster'
  const minShare = q?.minShare ?? fromMatch?.minShare ?? 0
  const minRating = q?.minRating ?? 0.5
  const asteroids = scope === 'start' ? [start.value] : props.world.asteroids
  const rated = asteroids.flatMap((a) => a.geysers).map((g) => geyserRating(g)).filter((r) => r != null)
  const share = fromMatch?.share ?? (rated.length ? rated.filter((r) => r >= minRating).length / rated.length : null)
  if (share == null) return null
  return { share, minShare, ok: share >= minShare, scope, well: minRating > 0.5 }
})

function groupTitle(group) {
  return t('home.search.geyser_group', { name: group.label, count: group.count, total: group.total, average: group.average, outputs: group.outputs.join(', ') })
}

// Touch screens have no hover: tapping a geyser chip shows its name and
// every output under the row.
const selected = ref(null)
function toggle(row, group) {
  selected.value = selected.value?.row === row && selected.value.group.type === group.type ? null : { row, group }
}
function caption(group) {
  if (group.missing) return t('home.search.missing_geyser', { name: group.label, count: group.count, min: group.min })
  return groupTitle(group)
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
  <article class="world-card h-100" :class="{ 'is-close': world.match }">
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
        :class="trait.status"
        :title="trait.status === 'missing' ? $t('home.search.missing_trait', { name: trait.label }) : trait.description ? `${trait.label}: ${trait.description}` : trait.label"
      >
        <img v-if="trait.icon" :src="trait.icon" alt="" loading="lazy" />
        <span class="world-card-trait-label">{{ trait.label }}</span>
      </span>
    </div>

    <div v-if="quality" class="world-card-quality" :class="quality.ok ? 'met' : 'unmet'">
      <i class="bi" :class="quality.ok ? 'bi-check-circle' : 'bi-x-circle'" aria-hidden="true"></i>
      {{
        $t(quality.well ? 'home.search.quality_well' : 'home.search.quality', {
          pct: Math.round(quality.share * 100),
          need: Math.round(quality.minShare * 100),
          where: quality.scope === 'start' ? $t('home.search.on_start') : $t('home.search.on_every'),
        })
      }}
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
            :class="[group.status, { selected: selected?.row === 'start' && selected.group.type === group.type }]"
            :title="groupTitle(group)"
            :aria-label="groupTitle(group)"
            @click="toggle('start', group)"
          >
            <GeyserBadge :icon="group.icon" :rating="group.rating" :count="group.count" :label="group.label" :size="34" />
            <span class="world-card-output" :class="`tone-${ratingClass(group.rating)}`">{{ shortOutput(group.total) }}</span>
          </button>
        </li>
        <li v-for="m in missingIn('start')" :key="`missing-${m.type}`">
          <button
            type="button"
            class="world-card-geyser missing"
            :title="$t('home.search.missing_geyser', { name: m.info.label, count: m.count, min: m.min })"
            @click="toggle('start', { type: m.type, label: m.info.label, count: m.count, min: m.min, missing: true })"
          >
            <GeyserBadge :icon="m.info.icon" :rating="null" :label="m.info.label" :size="34" />
            <span class="world-card-output">{{ m.count }}/{{ m.min }}</span>
          </button>
        </li>
        <li v-if="!startGroups.length && !missingIn('start').length" class="text-body-secondary small">{{ $t('home.search.no_geysers') }}</li>
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
            :class="[group.status, { selected: selected?.row === 'cluster' && selected.group.type === group.type }]"
            :title="groupTitle(group)"
            :aria-label="groupTitle(group)"
            @click="toggle('cluster', group)"
          >
            <GeyserBadge :icon="group.icon" :rating="group.rating" :count="group.count" :label="group.label" :size="28" />
            <span class="world-card-output" :class="`tone-${ratingClass(group.rating)}`">{{ shortOutput(group.total) }}</span>
          </button>
        </li>
        <li v-for="m in missingIn('cluster')" :key="`missing-${m.type}`">
          <button
            type="button"
            class="world-card-geyser missing"
            :title="$t('home.search.missing_geyser', { name: m.info.label, count: m.count, min: m.min })"
            @click="toggle('cluster', { type: m.type, label: m.info.label, count: m.count, min: m.min, missing: true })"
          >
            <GeyserBadge :icon="m.info.icon" :rating="null" :label="m.info.label" :size="28" />
            <span class="world-card-output">{{ m.count }}/{{ m.min }}</span>
          </button>
        </li>
        <li v-if="clusterHidden > 0" class="world-card-more">+{{ clusterHidden }}</li>
      </ul>
      <div v-if="selected?.row === 'cluster'" class="world-card-caption">{{ caption(selected.group) }}</div>
    </section>

    <footer class="world-card-actions">
      <router-link :to="`/world/${world.coordinate}`" class="btn btn-sm btn-warning flex-grow-1" @click="opened">
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
  --met: #4cee4c;
  --unmet: #ff6b6b;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  background: var(--bs-tertiary-bg);
}
.world-card.is-close {
  border-style: dashed;
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
.world-card-trait.met {
  border-color: var(--met);
}
.world-card-trait.unmet {
  border-color: var(--unmet);
}
.world-card-trait.missing {
  border: 1px dashed var(--unmet);
  opacity: 0.6;
}
.world-card-quality {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
}
.world-card-quality.met {
  color: var(--met);
}
.world-card-quality.unmet {
  color: var(--unmet);
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
.world-card-geyser.met {
  border-color: var(--met);
  background: rgba(76, 238, 76, 0.08);
}
.world-card-geyser.unmet {
  border-color: var(--unmet);
  background: rgba(255, 107, 107, 0.08);
}
.world-card-geyser.missing {
  border: 1px dashed var(--unmet);
  opacity: 0.55;
}
.world-card-geyser.selected {
  box-shadow: 0 0 0 1px var(--bs-secondary-color);
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
