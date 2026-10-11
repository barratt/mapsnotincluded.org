<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api } from '@/searchApi'
import { asteroidInfo } from '@/oniCatalog'

// Game mode and DLC toggles above the search, as image tiles like the Map
// Explorer's, plus an optional list of clusters to limit the search to.
// They override what the text says. Remembered in this browser.
const emit = defineEmits(['change'])

const STORAGE_KEY = 'mni_search_scope'
const SPRITES = '/images/oni/seed-browser/'

const MODES = [
  { id: null, name: 'Any game', img: null, icon: 'bi-globe2' },
  { id: 'base', name: 'Vanilla', img: '/images/oni/oni.png' },
  { id: 'spacedOut', name: 'Spaced Out!', img: '/images/oni/spacedout.png' },
]

const DLCS = [
  { id: 'FrostyPlanet', name: 'Frosty Planet', img: '/images/oni/FrostyPlanetPack.webp' },
  { id: 'PrehistoricPlanet', name: 'Prehistoric Planet', img: `${SPRITES}vanilla_spacepoi_dlc4_prehistoric_space_destination.webp` },
  { id: 'AquaticPlanet', name: 'Aquatic Planet', img: `${SPRITES}vanilla_spacepoi_dlc5_aquatic_space_destination.webp` },
]

// clusters: picked cluster prefixes; empty means every cluster.
const state = reactive({ gameMode: null, dlcs: DLCS.map((d) => d.id), clusters: [] })
const allClusters = ref([])
const pickerOpen = ref(false)

// Clusters that fit the game mode and owned DLC, grouped by mode.
const visibleClusters = computed(() =>
  allClusters.value.filter(
    (c) => (!state.gameMode || c.gameMode === state.gameMode) && c.requiredDlcs.every((d) => state.dlcs.includes(d)),
  ),
)
const groups = computed(() =>
  [
    { mode: 'base', label: 'Vanilla' },
    { mode: 'spacedOut', label: 'Spaced Out!' },
  ]
    .map((g) => ({ ...g, clusters: visibleClusters.value.filter((c) => c.gameMode === g.mode) }))
    .filter((g) => g.clusters.length),
)
const pickedVisible = computed(() => state.clusters.filter((p) => visibleClusters.value.some((c) => c.prefix === p)))

function toggleCluster(prefix) {
  state.clusters = state.clusters.includes(prefix) ? state.clusters.filter((p) => p !== prefix) : [...state.clusters, prefix]
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved) {
      state.gameMode = MODES.some((m) => m.id === saved.gameMode) ? saved.gameMode : null
      if (Array.isArray(saved.dlcs)) state.dlcs = DLCS.map((d) => d.id).filter((id) => saved.dlcs.includes(id))
      if (Array.isArray(saved.clusters)) state.clusters = saved.clusters.filter((p) => typeof p === 'string').slice(0, 60)
    }
  } catch {
    // Storage blocked or bad JSON: keep the defaults.
  }
}

// Only picked clusters that still fit the mode and DLC toggles are sent.
function options() {
  return { gameMode: state.gameMode, dlcs: [...state.dlcs], clusters: [...pickedVisible.value] }
}

function toggleDlc(id) {
  state.dlcs = state.dlcs.includes(id) ? state.dlcs.filter((d) => d !== id) : [...state.dlcs, id]
}

watch(
  state,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options()))
    } catch {
      // Not remembered, still applied.
    }
    emit('change', options())
  },
  { deep: true },
)

onMounted(async () => {
  load()
  emit('change', options())
  const { ok, data } = await api('/clusters').catch(() => ({ ok: false }))
  if (ok && Array.isArray(data)) {
    allClusters.value = data
    emit('change', options())
  }
})
</script>

<template>
  <div class="search-scope">
    <div class="scope-group" role="radiogroup" :aria-label="$t('home.search.scope_game')">
      <button
        v-for="mode in MODES"
        :key="String(mode.id)"
        type="button"
        role="radio"
        class="scope-tile"
        :class="{ selected: state.gameMode === mode.id }"
        :aria-checked="state.gameMode === mode.id"
        @click="state.gameMode = mode.id"
      >
        <img v-if="mode.img" :src="mode.img" alt="" />
        <i v-else class="bi" :class="mode.icon" aria-hidden="true"></i>
        <span>{{ mode.name }}</span>
      </button>
    </div>
    <div class="scope-group" :aria-label="$t('home.search.scope_dlcs')">
      <button
        v-for="dlc in DLCS"
        :key="dlc.id"
        type="button"
        class="scope-tile"
        :class="{ selected: state.dlcs.includes(dlc.id) }"
        :aria-pressed="state.dlcs.includes(dlc.id)"
        :title="$t('home.search.scope_dlc_hint')"
        @click="toggleDlc(dlc.id)"
      >
        <img :src="dlc.img" alt="" />
        <span>{{ dlc.name }}</span>
      </button>
    </div>

    <div v-if="allClusters.length" class="cluster-picker">
      <button type="button" class="btn btn-sm btn-outline-secondary" :aria-expanded="pickerOpen" @click="pickerOpen = !pickerOpen">
        <i class="bi bi-globe-americas" aria-hidden="true"></i>
        {{ pickedVisible.length ? $t('home.search.clusters_some', pickedVisible.length) : $t('home.search.clusters_all') }}
        <i class="bi" :class="pickerOpen ? 'bi-chevron-up' : 'bi-chevron-down'" aria-hidden="true"></i>
      </button>
      <button v-if="pickedVisible.length" type="button" class="btn btn-sm btn-link" @click="state.clusters = []">
        {{ $t('home.search.clusters_clear') }}
      </button>

      <div v-if="pickerOpen" class="cluster-panel">
        <p class="small text-body-secondary mb-2">{{ $t('home.search.clusters_hint') }}</p>
        <div v-for="group in groups" :key="group.mode" class="mb-2">
          <div class="cluster-group-title">{{ group.label }}</div>
          <div class="cluster-grid">
            <button
              v-for="c in group.clusters"
              :key="c.prefix"
              type="button"
              class="cluster-chip"
              :class="{ selected: state.clusters.includes(c.prefix), unavailable: !c.worlds }"
              :aria-pressed="state.clusters.includes(c.prefix)"
              :title="c.worlds ? $t('home.search.cluster_worlds', { n: c.worlds.toLocaleString() }) : $t('home.search.cluster_unavailable')"
              @click="toggleCluster(c.prefix)"
            >
              <img v-if="c.startAsteroid && asteroidInfo(c.startAsteroid).icon" :src="asteroidInfo(c.startAsteroid).icon" alt="" loading="lazy" />
              <i v-else class="bi bi-circle" aria-hidden="true"></i>
              <span>{{ c.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cluster-picker {
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem 0.5rem;
}
.cluster-panel {
  flex-basis: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  background: var(--bs-tertiary-bg);
  max-height: 22rem;
  overflow-y: auto;
}
.cluster-group-title {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  margin-bottom: 0.3rem;
}
.cluster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: 0.35rem;
}
.cluster-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  background: var(--bs-body-bg);
  color: var(--bs-secondary-color);
  font-size: 0.8rem;
  text-align: left;
}
.cluster-chip img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex: none;
}
.cluster-chip i {
  width: 26px;
  text-align: center;
}
.cluster-chip.selected {
  border-color: var(--bs-warning);
  color: var(--bs-body-color);
  background: rgba(255, 193, 7, 0.08);
}
.cluster-chip.unavailable {
  opacity: 0.45;
}
.search-scope {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1.25rem;
  margin-bottom: 0.75rem;
}
.scope-group {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.scope-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  width: 5.2rem;
  min-height: 4.4rem;
  padding: 0.35rem 0.25rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  background: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
  font-size: 0.72rem;
  line-height: 1.1;
  opacity: 0.55;
  filter: grayscale(0.8);
  transition: opacity 0.15s, filter 0.15s, border-color 0.15s;
}
.scope-tile img {
  max-width: 100%;
  height: 2.2rem;
  object-fit: contain;
}
.scope-tile i {
  font-size: 1.6rem;
  line-height: 2.2rem;
}
.scope-tile.selected {
  opacity: 1;
  filter: none;
  color: var(--bs-body-color);
  border-color: var(--bs-warning);
}
.scope-tile:hover {
  opacity: 0.9;
}
</style>
