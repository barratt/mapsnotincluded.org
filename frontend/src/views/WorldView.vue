<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { loadWorldDetail, loadWorldTiles } from '@/worldDetail'
import AdSlot from '@/components/AdSlot.vue'
import StoreLinks from '@/components/StoreLinks.vue'
import SupportLinks from '@/components/SupportLinks.vue'
import { productsForCluster } from '@/siteConfig'
import { SPACE_BACKGROUND, asteroidInfo, traitInfo } from '@/oniCatalog'
import AsteroidMap from '@/components/world/AsteroidMap.vue'
import BiomeLegend from '@/components/world/BiomeLegend.vue'
import ElementLegend from '@/components/world/ElementLegend.vue'
import ClusterLayout from '@/components/world/ClusterLayout.vue'
import ClusterOverview from '@/components/world/ClusterOverview.vue'
import GeyserTable from '@/components/world/GeyserTable.vue'
import PoiList from '@/components/world/PoiList.vue'
import StarmapView from '@/components/world/StarmapView.vue'

const route = useRoute()
const { t } = useI18n()
const coordinate = computed(() => String(route.params.coordinate).toUpperCase())

const loading = ref(true)
// Shallow: the tile arrays inside must not become reactive proxies.
const detail = shallowRef(null)
const loadError = ref(null)
const source = ref(null)
const selectedIndex = ref(0)
const selectedMarker = ref(null)
const highlightZone = ref(null)
const highlightElement = ref(null)
const copied = ref(false)
// Tile state: variant shown ('presettle' | 'settled' | null), what the
// settled variant is doing, whether tiles are still being generated, and why
// there is no world (coordinate refused / worldgen failure).
const tileVariant = ref(null)
const settleState = ref(null)
const tilesPending = ref(false)
const refused = ref(null)
const failure = ref(null)

let pollTimer = null
let loadId = 0
const stopPolling = () => clearTimeout(pollTimer)
onBeforeUnmount(stopPolling)

// Swaps in a newer payload (tiles arrived, or settled replaced pre-settle)
// and keeps the selected asteroid.
function applyTiles(result) {
  const selectedId = asteroid.value?.id
  detail.value = result.detail
  source.value = 'api'
  tileVariant.value = result.variant
  settleState.value = result.settle
  tilesPending.value = false
  const index = result.detail.asteroids.findIndex((a) => a.id === selectedId)
  if (index >= 0) selectedIndex.value = index
}

// Polls for tiles still being generated, then for the settled variant while
// it is being settled. Gives up after ~5 minutes.
function poll(id, variant, delayMs, attempt = 0) {
  stopPolling()
  if (attempt > 120) {
    tilesPending.value = false
    if (settleState.value === 'generating') settleState.value = 'failed'
    return
  }
  pollTimer = setTimeout(async () => {
    const result = await loadWorldTiles(coordinate.value, variant ? { variant } : undefined)
    if (id !== loadId) return
    if (result.status === 'ok') {
      applyTiles(result)
      if (!variant && ['generating', 'busy'].includes(result.settle)) poll(id, 'settled', 5000)
    } else if (result.status === 'generating' || result.status === 'busy') {
      poll(id, variant, Math.min(10000, result.retryAfterMs ?? 3000), attempt + 1)
    } else {
      tilesPending.value = false
      if (variant) settleState.value = 'failed'
    }
  }, Math.max(1000, delayMs))
}

async function load() {
  const id = ++loadId
  stopPolling()
  loading.value = true
  detail.value = null
  refused.value = null
  failure.value = null
  const result = await loadWorldDetail(coordinate.value)
  if (id !== loadId) return
  detail.value = result.detail
  source.value = result.source
  loadError.value = result.error ?? null
  refused.value = result.refused ?? null
  failure.value = result.failure ?? null
  tileVariant.value = result.tiles?.variant ?? (result.detail?.asteroids?.some((a) => a.tileData) ? 'presettle' : null)
  settleState.value = result.tiles?.settle ?? null
  tilesPending.value = Boolean(result.pending)
  const start = result.detail?.asteroids?.findIndex((a) => a.start) ?? -1
  selectedIndex.value = Math.max(0, start)
  loading.value = false
  if (result.pending) poll(id, null, result.pending.retryAfterMs ?? 2000)
  else if (['generating', 'busy'].includes(result.tiles?.settle)) poll(id, 'settled', 5000)
}
watch(coordinate, load, { immediate: true })

watch(selectedIndex, () => {
  selectedMarker.value = null
  highlightZone.value = null
  highlightElement.value = null
})

const asteroids = computed(() => detail.value?.asteroids ?? [])
const asteroid = computed(() => asteroids.value[selectedIndex.value] ?? null)
const asteroidName = computed(() => (asteroid.value ? asteroidInfo(asteroid.value.id, asteroid.value.name).label : ''))
const traits = computed(() => (asteroid.value?.traits ?? []).map(traitInfo))
const hasMap = computed(
  () =>
    asteroid.value &&
    (asteroid.value.tileData || asteroid.value.biomes?.length || asteroid.value.geysers?.some((g) => g.x != null)) &&
    asteroid.value.sizeX,
)
const hasTiles = computed(() => Boolean(asteroid.value?.tileData))
const clusterHasBiomes = computed(() => asteroids.value.length > 1 && asteroids.value.every((a) => a.biomes?.length && a.sizeX))
const totalGeysers = computed(() => asteroids.value.reduce((n, a) => n + (a.geysers?.length ?? 0), 0))
const starmap = computed(() => (detail.value?.starmap?.entries?.length ? detail.value.starmap : null))

const gameModeLabel = computed(() => {
  const mode = detail.value?.gameMode
  if (mode === 'spacedOut') return t('world.mode.spaced_out')
  if (mode === 'base' || mode === 'baseGame') return t('world.mode.base_game')
  return mode ?? ''
})

async function copyCoordinate() {
  try {
    await navigator.clipboard.writeText(coordinate.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}

function selectAsteroid(index) {
  selectedIndex.value = index
  document.getElementById('asteroid-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const pageStyle = { '--sb-space': `url(${SPACE_BACKGROUND})` }
</script>

<template>
  <main class="world-page" :style="pageStyle">
    <div class="container-xl py-3">
      <!-- Header -->
      <header class="sb-panel world-header">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <h1 class="world-title">{{ detail?.clusterName ?? $t('world.title') }}</h1>
          <span v-if="detail?.synthetic" class="badge sb-preview-badge" :title="$t('world.synthetic_notice')">
            <i class="bi bi-eye-fill me-1" aria-hidden="true"></i>{{ $t('world.preview_badge') }}
          </span>
          <span v-if="gameModeLabel" class="badge text-bg-secondary">{{ gameModeLabel }}</span>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
          <code class="world-coordinate">{{ coordinate }}</code>
          <button type="button" class="btn btn-sm btn-outline-light" :aria-label="$t('home.search.copy')" @click="copyCoordinate">
            <i class="bi" :class="copied ? 'bi-check2' : 'bi-clipboard'" aria-hidden="true"></i>
            {{ copied ? $t('world.copied') : $t('world.copy') }}
          </button>
          <span class="visually-hidden" aria-live="polite">{{ copied ? $t('world.copied') : '' }}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-2">
          <router-link :to="`/map-explorer/${coordinate}`" class="btn btn-sm btn-warning">
            <i class="bi bi-map me-1" aria-hidden="true"></i>{{ $t('world.map_explorer') }}
          </router-link>
          <router-link to="/" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-search me-1" aria-hidden="true"></i>{{ $t('world.new_search') }}
          </router-link>
        </div>
        <dl v-if="detail" class="world-facts mt-2 mb-0">
          <div>
            <dt>{{ $t('world.facts.asteroids') }}</dt>
            <dd>{{ asteroids.length }}</dd>
          </div>
          <div>
            <dt>{{ $t('world.facts.geysers') }}</dt>
            <dd>{{ totalGeysers }}</dd>
          </div>
          <div v-if="detail.gameVersion">
            <dt>{{ $t('world.facts.version') }}</dt>
            <dd>{{ detail.gameVersion }}</dd>
          </div>
          <div v-if="detail.cluster">
            <dt>{{ $t('world.facts.cluster') }}</dt>
            <dd class="font-monospace small">{{ detail.cluster }}</dd>
          </div>
        </dl>
        <StoreLinks v-if="detail?.cluster && productsForCluster(detail.cluster).length" class="mt-3" :products="productsForCluster(detail.cluster)" />
      </header>
      <AdSlot placement="world" />
      <AdSlot placement="sidebar" />

      <div v-if="detail?.synthetic" class="alert sb-alert mt-3 mb-0">
        <i class="bi bi-info-circle me-1" aria-hidden="true"></i>{{ $t('world.synthetic_notice') }}
      </div>
      <div v-if="source === 'summary'" class="alert sb-alert mt-3 mb-0">{{ $t('world.map_coming') }}</div>

      <div v-if="loading" class="text-center text-body-secondary my-5">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>{{ $t('world.loading') }}
        <div class="small mt-1">{{ $t('world.loading_hint') }}</div>
      </div>
      <div v-else-if="!detail && loadError?.status === 'worldgen_failure'" class="alert sb-alert mt-3">
        {{ $t('world.worldgen_failure') }}
        <div v-if="loadError.reason" class="small text-body-secondary mt-1 font-monospace">{{ loadError.reason }}</div>
      </div>
      <div v-else-if="!detail && loadError?.status === 'busy'" class="alert sb-alert mt-3">
        {{ $t('world.busy') }}
        <button type="button" class="btn btn-sm btn-outline-light ms-2" @click="load">{{ $t('world.retry') }}</button>
      </div>
      <div v-else-if="refused" class="alert sb-alert mt-3">
        <p class="mb-1">{{ $t(refused.status === 'rewritten' ? 'world.tiles.rewritten' : 'world.tiles.refused') }}</p>
        <p v-if="refused.reason || refused.error" class="small text-body-secondary mb-1">{{ refused.reason || refused.error }}</p>
        <router-link v-if="refused.status === 'rewritten' && refused.coordinate" :to="`/world/${refused.coordinate}`" class="btn btn-sm btn-warning">
          {{ $t('world.tiles.open_rewritten', { coordinate: refused.coordinate }) }}
        </router-link>
      </div>
      <div v-else-if="failure !== null" class="alert sb-alert mt-3">
        <p class="mb-1">{{ $t('world.tiles.worldgen_failure') }}</p>
        <p v-if="failure" class="small text-body-secondary mb-0">{{ failure }}</p>
      </div>
      <div v-else-if="!detail" class="alert sb-alert mt-3">{{ $t('world.not_indexed') }}</div>

      <template v-else>
        <!-- Cluster overview / asteroid picker -->
        <section class="sb-panel mt-3" aria-labelledby="cluster-heading">
          <h2 id="cluster-heading" class="sb-heading">
            {{ asteroids.length > 1 ? $t('world.cluster_heading', { n: asteroids.length }) : $t('world.asteroid_heading') }}
          </h2>
          <ClusterLayout v-if="clusterHasBiomes" v-model="selectedIndex" :asteroids="asteroids" class="mb-3" />
          <ClusterOverview v-model="selectedIndex" :asteroids="asteroids" />
        </section>

        <!-- Selected asteroid -->
        <section v-if="asteroid" id="asteroid-detail" class="mt-3" aria-labelledby="asteroid-heading">
          <div class="row g-3">
            <div class="col-12 col-lg-7 col-xl-8">
              <div class="sb-panel h-100">
                <h2 id="asteroid-heading" class="sb-heading d-flex flex-wrap align-items-center gap-2">
                  {{ asteroidName }}
                  <span v-if="asteroid.start" class="badge sb-start-badge">{{ $t('world.start') }}</span>
                  <span
                    v-if="hasTiles"
                    class="badge"
                    :class="tileVariant === 'settled' ? 'sb-settled-badge' : 'sb-presettle-badge'"
                    :title="$t(tileVariant === 'settled' ? 'world.tiles.settled_notice' : 'world.tiles.presettle_notice')"
                  >
                    {{ $t(tileVariant === 'settled' ? 'world.tiles.settled' : 'world.tiles.presettle') }}
                  </span>
                  <span v-if="hasTiles && tileVariant !== 'settled' && settleState === 'generating'" class="badge text-bg-secondary">
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>{{ $t('world.tiles.settling') }}
                  </span>
                  <span v-if="tilesPending" class="badge text-bg-secondary">
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>{{ $t('world.generating') }}
                  </span>
                </h2>
                <AsteroidMap
                  v-if="hasMap"
                  v-model:selected="selectedMarker"
                  :asteroid="asteroid"
                  :tiles="detail.tiles"
                  :highlight-zone="highlightZone"
                  :highlight-element="highlightElement"
                />
                <div v-else class="alert sb-alert mb-0">{{ $t('world.map_coming') }}</div>
              </div>
            </div>

            <div class="col-12 col-lg-5 col-xl-4 d-flex flex-column gap-3">
              <div class="sb-panel">
                <h3 class="sb-subheading">{{ $t('world.details') }}</h3>
                <dl class="detail-list mb-0">
                  <dt>{{ $t('world.facts.size') }}</dt>
                  <dd>{{ asteroid.sizeX ? $t('world.size_value', { x: asteroid.sizeX, y: asteroid.sizeY }) : '–' }}</dd>
                  <dt>{{ $t('world.facts.geysers') }}</dt>
                  <dd>{{ asteroid.geysers?.length ?? 0 }}</dd>
                  <dt>{{ $t('world.facts.pois') }}</dt>
                  <dd>{{ asteroid.pois?.length ?? 0 }}</dd>
                  <dt>{{ $t('world.facts.biomes') }}</dt>
                  <dd>{{ asteroid.biomes?.length ?? 0 }}</dd>
                </dl>
              </div>

              <div class="sb-panel">
                <h3 class="sb-subheading">{{ $t('world.traits') }}</h3>
                <ul v-if="traits.length" class="trait-list list-unstyled mb-0">
                  <li v-for="trait in traits" :key="trait.id" :style="{ '--trait': trait.color }">
                    <span class="trait-icon">
                      <img v-if="trait.icon" :src="trait.icon" alt="" />
                      <i v-else class="bi bi-stars" aria-hidden="true"></i>
                    </span>
                    <span>
                      <span class="trait-name">{{ trait.label }}</span>
                      <span v-if="trait.description" class="d-block small text-body-secondary">{{ trait.description }}</span>
                    </span>
                  </li>
                </ul>
                <p v-else class="text-body-secondary mb-0">{{ $t('world.no_traits') }}</p>
              </div>

              <div class="sb-panel">
                <h3 class="sb-subheading">{{ $t('world.biomes') }}</h3>
                <BiomeLegend v-model="highlightZone" :asteroid="asteroid" />
              </div>

              <div v-if="hasTiles" class="sb-panel">
                <h3 class="sb-subheading">{{ $t('world.tiles.elements') }}</h3>
                <ElementLegend v-model="highlightElement" :asteroid="asteroid" :tiles="detail.tiles" />
              </div>
            </div>
          </div>

          <div class="sb-panel mt-3">
            <h3 class="sb-subheading">{{ $t('world.geysers_heading', { n: asteroid.geysers?.length ?? 0 }) }}</h3>
            <GeyserTable v-model:selected="selectedMarker" :geysers="asteroid.geysers ?? []" />
          </div>

          <div class="sb-panel mt-3">
            <h3 class="sb-subheading">{{ $t('world.pois_heading', { n: asteroid.pois?.length ?? 0 }) }}</h3>
            <PoiList v-model:selected="selectedMarker" :pois="asteroid.pois ?? []" />
          </div>
        </section>

        <section v-if="starmap" class="sb-panel mt-3" aria-labelledby="starmap-heading">
          <h2 id="starmap-heading" class="sb-heading">{{ $t('world.starmap.heading') }}</h2>
          <StarmapView :starmap="starmap" :asteroids="asteroids" :selected="selectedIndex" @select-asteroid="selectAsteroid" />
        </section>
      </template>

      <footer class="world-credits">
        <i18n-t keypath="world.credits" tag="p" class="mb-0">
          <template #stefan>
            <a href="https://github.com/StefanOltmann/oni-seed-browser" target="_blank" rel="noopener">ONI Seed Browser</a>
          </template>
          <template #sgt>
            <a href="https://github.com/Sgt-Imalas/ONITraitFinder" target="_blank" rel="noopener">ONI Trait Finder</a>
          </template>
        </i18n-t>
      </footer>
      <SupportLinks class="mt-4" />
    </div>
  </main>
</template>

<style>
.world-page {
  --sb-anthracite: #222529;
  --sb-panel: rgba(34, 37, 41, 0.82);
  --sb-card: rgba(77, 77, 77, 0.45);
  --sb-chip: #545454;
  --sb-border: rgba(242, 242, 242, 0.32);
  --sb-muted: rgba(242, 242, 242, 0.7);
  --sb-hover: #ffeb3b;
  --sb-dimmed: #5c5c5c;
  --sb-good: #4cee4c;
  --sb-medium: #ffee58;
  --sb-bad: #ffa192;
  --sb-good-ring: rgba(0, 255, 0, 0.65);
  --sb-medium-ring: rgba(255, 255, 0, 0.65);
  --sb-bad-ring: rgba(255, 161, 146, 0.65);
  min-height: 100vh;
  background:
    linear-gradient(rgba(18, 20, 24, 0.55), rgba(18, 20, 24, 0.75)),
    var(--sb-space) center / cover fixed,
    #15171b;
}
.world-page .sb-panel {
  padding: 0.9rem 1rem;
  border: 1px solid var(--sb-border);
  border-radius: 10px;
  background: var(--sb-panel);
}
.world-page .sb-heading {
  margin-bottom: 0.75rem;
  font-size: 1.75rem;
}
.world-page .sb-subheading {
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
}
.world-page .sb-alert {
  border: 1px solid var(--sb-border);
  background: var(--sb-panel);
  color: var(--bs-body-color);
}
.world-page .sb-start-badge {
  background: var(--sb-hover);
  color: #222529;
  font-size: 0.8rem;
}
.world-page .sb-settled-badge {
  background: #2e7d32;
  color: #fff;
  font-size: 0.8rem;
}
.world-page .sb-presettle-badge {
  background: #455a64;
  color: #fff;
  font-size: 0.8rem;
  cursor: help;
}
.world-page .sb-preview-badge {
  background: #7e57c2;
  color: #fff;
}
.world-title {
  margin: 0;
  font-size: 2.4rem;
  line-height: 1;
}
.world-coordinate {
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  color: var(--bs-body-color);
  font-size: 1rem;
  word-break: break-all;
}
.world-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
}
.world-facts dt,
.detail-list dt {
  font-weight: normal;
  color: var(--sb-muted);
}
.world-facts div {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
}
.world-facts dd {
  margin: 0;
}
.detail-list {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
}
.detail-list dd {
  margin: 0;
  text-align: right;
}
.trait-list {
  display: grid;
  gap: 0.5rem;
  font-size: 1.15rem;
}
.trait-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  line-height: 1.2;
}
.trait-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 3px solid var(--trait);
}
.trait-icon img {
  width: 24px;
  height: 24px;
}
.trait-name {
  color: var(--trait);
  filter: brightness(1.15);
}
.world-credits {
  margin-top: 1.5rem;
  padding: 0.75rem 0 1rem;
  border-top: 1px solid var(--sb-border);
  font-size: 1rem;
  color: var(--sb-muted);
}
.world-credits a {
  color: var(--bs-body-color);
}
@media (max-width: 575.98px) {
  .world-page .sb-panel {
    padding: 0.75rem;
  }
  .world-title {
    font-size: 2rem;
  }
}
</style>
