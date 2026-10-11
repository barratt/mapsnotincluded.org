<script setup>
import { onMounted, reactive, watch } from 'vue'

// Game mode and DLC toggles above the search, as image tiles like the Map
// Explorer's. They override what the text says. Remembered in this browser.
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

const state = reactive({ gameMode: null, dlcs: DLCS.map((d) => d.id) })

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved) {
      state.gameMode = MODES.some((m) => m.id === saved.gameMode) ? saved.gameMode : null
      if (Array.isArray(saved.dlcs)) state.dlcs = DLCS.map((d) => d.id).filter((id) => saved.dlcs.includes(id))
    }
  } catch {
    // Storage blocked or bad JSON: keep the defaults.
  }
}

function options() {
  return { gameMode: state.gameMode, dlcs: [...state.dlcs] }
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

onMounted(() => {
  load()
  emit('change', options())
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
  </div>
</template>

<style scoped>
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
