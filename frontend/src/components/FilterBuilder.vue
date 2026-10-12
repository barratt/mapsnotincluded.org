<script setup>
// Search conditions as pills: what the AI understood from a typed search, or
// what the player picked here. "Add filter" opens a picker (geysers, traits,
// distances, world features, geyser quality) and each pill opens a small
// editor. Game mode, DLCs and clusters are the toggles above the search, not
// pills. Searching with the pills skips the AI.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/searchApi'
import { asteroidInfo, geyserInfo, poiInfo, traitInfo, zoneInfo } from '@/oniCatalog'

const props = defineProps({
  // The filter object (see the search API), or null for no conditions.
  modelValue: { type: Object, default: null },
  // Page toggles: { gameMode, dlcs, clusters }.
  scope: { type: Object, default: null },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'search'])
const { t } = useI18n()

// ---- Catalog ---------------------------------------------------------------

let catalogLoad = null
const catalog = ref(null)
const clusterMeta = ref({})
async function loadCatalog() {
  catalogLoad ??= Promise.all([api('/filter-catalog?v=3'), api('/clusters')]).then(([c, k]) => {
    if (c.ok) catalog.value = c.data
    const list = Array.isArray(k.data) ? k.data : k.data?.clusters ?? []
    clusterMeta.value = Object.fromEntries(list.map((x) => [x.prefix, x]))
  })
  return catalogLoad.catch(() => {})
}
onMounted(loadCatalog)

const filter = computed(() => props.modelValue ?? {})
const clone = (f) => JSON.parse(JSON.stringify(f ?? {}))
function update(mutate) {
  const next = clone(filter.value)
  mutate(next)
  // Drop empty parts so the filter stays valid.
  if (next.geysers && !next.geysers.length) delete next.geysers
  if (next.traits) {
    for (const k of ['require', 'exclude']) if (next.traits[k] && !next.traits[k].length) delete next.traits[k]
    if (!next.traits.require && !next.traits.exclude) delete next.traits
  }
  for (const k of ['clusters', 'dlcs', 'pois', 'worlds', 'critters', 'plants']) if (next[k] && !next[k].length) delete next[k]
  if (next.biomes) {
    for (const k of ['require', 'exclude']) if (next.biomes[k] && !next.biomes[k].length) delete next.biomes[k]
    if (!next.biomes.require && !next.biomes.exclude) delete next.biomes
  }
  emit('update:modelValue', Object.keys(next).length ? next : null)
}

// Clusters the search can cover, for "impossible" marks: the filter's own
// clusters and game mode, else the page toggles.
const eligible = computed(() => {
  const stats = catalog.value?.clusters ?? {}
  const mode = filter.value.gameMode ?? props.scope?.gameMode ?? null
  const owned = new Set([...(props.scope?.dlcs ?? ['FrostyPlanet', 'PrehistoricPlanet', 'AquaticPlanet']), ...(filter.value.dlcs ?? [])])
  const picked = filter.value.clusters?.length ? filter.value.clusters : props.scope?.clusters?.length ? props.scope.clusters : null
  return Object.keys(stats).filter((p) => {
    const meta = clusterMeta.value[p]
    if (picked && !picked.includes(p)) return false
    if (!meta) return !picked
    return (!mode || meta.gameMode === mode) && (meta.requiredDlcs ?? []).every((d) => owned.has(d))
  })
})
function geyserImpossible(type, where) {
  const stats = catalog.value?.clusters
  if (!stats || !eligible.value.length) return false
  return eligible.value.every((p) => !(stats[p]?.[where]?.[type] > 0))
}
function traitImpossible(trait) {
  const mode = filter.value.gameMode ?? props.scope?.gameMode
  if (trait.spacedOutOnly && mode === 'base') return true
  return (filter.value.traits?.require ?? []).some((r) => trait.exclusiveWith.includes(r))
}

// ---- Pills -----------------------------------------------------------------

const geyserName = (id) => catalog.value?.geysers.find((g) => g.id === id)?.name ?? geyserInfo(id).label
const traitName = (id) => catalog.value?.traits.find((x) => x.id === id)?.name ?? traitInfo(id).label
const typesOf = (g) => g.types ?? (g.type ? [g.type] : [])
const zoneName = (id) => catalog.value?.zones?.find((z) => z.id === id)?.name ?? zoneInfo(id).label
const poiName = (id) => catalog.value?.pois?.find((p) => p.id === id)?.name ?? poiInfo(id).label
const asteroidName = (id) => asteroidInfo(id).label.replace(/([a-z])([A-Z])/g, '$1 $2')
const critterName = (id) => catalog.value?.critters?.find((c) => c.id === id)?.name ?? id.replace(/([a-z])([A-Z])/g, '$1 $2')
const plantName = (id) => catalog.value?.plants?.find((c) => c.id === id)?.name ?? id.replace(/([a-z])([A-Z])/g, '$1 $2')
// Critters and plants share their filter shape: list key, pill kind, names.
const SPAWNS = [
  { list: 'critters', kind: 'critter', name: critterName, any: 'critters_any' },
  { list: 'plants', kind: 'plant', name: plantName, any: 'plants_any' },
]
const critterTypesOf = (c) => c.types ?? (c.type ? [c.type] : [])
const whereLabel = (s) => (s === 'start' ? t('home.filters.on_start') : t('home.filters.in_cluster'))

function countLabel(g) {
  const min = g.minCount ?? (g.maxCount != null ? 0 : 1)
  const max = g.maxCount ?? null
  if (max === 0) return t('home.filters.none')
  if (max === null) return `${t('home.filters.at_least').toLowerCase()} ${min}`
  if (min === 0) return `${t('home.filters.at_most').toLowerCase()} ${max}`
  if (min === max) return `${t('home.filters.exactly').toLowerCase()} ${min}`
  return `${min} to ${max}`
}

const pills = computed(() => {
  const f = filter.value
  const out = []
  ;(f.geysers ?? []).forEach((g, i) => {
    const types = typesOf(g)
    const names = types.length > 3 ? t('home.filters.any_of_n', { first: geyserName(types[0]), n: types.length - 1 }) : types.map(geyserName).join(' or ')
    out.push({
      key: `g:${i}`,
      kind: 'geyser',
      index: i,
      icon: geyserInfo(types[0]).icon,
      label: `${names} ${countLabel(g)}`,
      sub: [g.maxDistance ? t('home.filters.near_pod', { n: g.maxDistance }) : whereLabel(g.scope ?? 'cluster'), g.minAvgOutput ? t('home.filters.output_at_least', { n: g.minAvgOutput }) : null].filter(Boolean).join(' · '),
      title: types.map(geyserName).join(', '),
    })
  })
  for (const id of f.traits?.require ?? []) out.push({ key: `t+${id}`, kind: 'trait', id, icon: traitInfo(id).icon, label: traitName(id), sub: whereLabel(f.traits.scope ?? 'start') })
  for (const id of f.traits?.exclude ?? []) out.push({ key: `t-${id}`, kind: 'trait', id, excluded: true, icon: traitInfo(id).icon, label: `${t('home.filters.no')} ${traitName(id)}`, sub: whereLabel(f.traits.scope ?? 'start') })
  if (f.quality) {
    out.push({
      key: 'quality',
      kind: 'quality',
      label: t('home.filters.quality_pill', { share: Math.round(f.quality.minShare * 100), level: (f.quality.minRating ?? 0.5) > 0.5 ? t('home.filters.well_above') : t('home.filters.above') }),
      sub: whereLabel(f.quality.scope ?? 'cluster'),
    })
  }
  if (f.traitCount) {
    const { min = 0, max = null } = f.traitCount
    out.push({ key: 'traitCount', kind: 'traitCount', label: max === 0 ? t('home.filters.no_traits') : t('home.filters.trait_count_pill', { n: countLabel({ minCount: min, maxCount: max }) }), sub: whereLabel(f.traitCount.scope ?? 'start') })
  }
  for (const id of f.biomes?.require ?? []) out.push({ key: `b+${id}`, kind: 'biome', id, icon: zoneInfo(id).icon, label: t('home.filters.biome_pill', { name: zoneName(id) }), sub: whereLabel(f.biomes.scope ?? 'start') })
  for (const id of f.biomes?.exclude ?? []) out.push({ key: `b-${id}`, kind: 'biome', id, excluded: true, icon: zoneInfo(id).icon, label: `${t('home.filters.no')} ${t('home.filters.biome_pill', { name: zoneName(id) })}`, sub: whereLabel(f.biomes.scope ?? 'start') })
  ;(f.pois ?? []).forEach((p, i) => out.push({ key: `p:${i}`, kind: 'poi', index: i, icon: poiInfo(p.type).icon, label: `${poiName(p.type)} ${countLabel(p)}`, sub: whereLabel(p.scope ?? 'cluster') }))
  for (const sp of SPAWNS) {
    ;(f[sp.list] ?? []).forEach((c, i) => {
      const types = critterTypesOf(c)
      const names = !types.length ? t(`home.filters.${sp.any}`) : types.length > 3 ? t('home.filters.any_of_n', { first: sp.name(types[0]), n: types.length - 1 }) : types.map(sp.name).join(' or ')
      out.push({
        key: `${sp.kind}:${i}`,
        kind: sp.kind,
        list: sp.list,
        index: i,
        label: `${names} ${countLabel(c)}`,
        sub: c.maxDistance ? t('home.filters.near_pod', { n: c.maxDistance }) : whereLabel(c.scope ?? 'start'),
        title: types.map(sp.name).join(', '),
      })
    })
  }
  ;(f.worlds ?? []).forEach((w, i) => out.push({ key: `w:${i}`, kind: 'world', index: i, icon: asteroidInfo(w.world).icon, label: asteroidName(w.world), sub: t('home.filters.near_home', { n: w.maxDistance ?? '?' }) }))
  return out
})

function removePill(p) {
  editing.value = null
  update((f) => {
    if (p.kind === 'geyser') f.geysers.splice(p.index, 1)
    else if (p.kind === 'poi') f.pois.splice(p.index, 1)
    else if (p.kind === 'world') f.worlds.splice(p.index, 1)
    else if (p.kind === 'critter' || p.kind === 'plant') f[p.list].splice(p.index, 1)
    else if (p.kind === 'traitCount') delete f.traitCount
    else if (p.kind === 'biome') f.biomes[p.excluded ? 'exclude' : 'require'] = f.biomes[p.excluded ? 'exclude' : 'require'].filter((x) => x !== p.id)
    else if (p.kind === 'trait') f.traits[p.excluded ? 'exclude' : 'require'] = f.traits[p.excluded ? 'exclude' : 'require'].filter((x) => x !== p.id)
    else if (p.kind === 'quality') delete f.quality
  })
}

// ---- Pill editor -----------------------------------------------------------

const editing = ref(null) // pill key
const editPill = computed(() => pills.value.find((p) => p.key === editing.value) ?? null)
const editGeyser = computed(() => (editPill.value?.kind === 'geyser' ? filter.value.geysers[editPill.value.index] : null))

function countMode(g) {
  if (g.maxCount === 0) return 'none'
  if (g.maxCount != null && (g.minCount ?? 0) === g.maxCount) return 'exactly'
  if (g.maxCount != null && !g.minCount) return 'at_most'
  return 'at_least'
}
const countValue = (g) => (countMode(g) === 'at_most' ? g.maxCount : g.minCount ?? 1)

function setGeyser(changes) {
  const i = editPill.value.index
  update((f) => {
    const g = { ...f.geysers[i], ...changes }
    for (const k of Object.keys(g)) if (g[k] === null || g[k] === undefined || g[k] === '') delete g[k]
    f.geysers[i] = g
  })
}
function setCount(mode, value) {
  const n = Math.max(0, Math.min(30, Math.round(Number(value) || 0)))
  if (mode === 'none') setGeyser({ minCount: null, maxCount: 0 })
  else if (mode === 'at_most') setGeyser({ minCount: null, maxCount: Math.max(1, n) })
  else if (mode === 'exactly') setGeyser({ minCount: Math.max(1, n), maxCount: Math.max(1, n) })
  else setGeyser({ minCount: Math.max(1, n), maxCount: null })
}
function setTypes(types) {
  if (!types.length) return
  setGeyser(types.length === 1 ? { type: types[0], types: null } : { types, type: null })
}

function toggleTraitSense(p) {
  update((f) => {
    const from = p.excluded ? 'exclude' : 'require'
    const to = p.excluded ? 'require' : 'exclude'
    f.traits[from] = f.traits[from].filter((x) => x !== p.id)
    f.traits[to] = [...(f.traits[to] ?? []), p.id]
  })
  editing.value = `${p.excluded ? 't+' : 't-'}${p.id}`
}
const setTraitScope = (scope) => update((f) => (f.traits.scope = scope))
const setQuality = (changes) => update((f) => (f.quality = { ...f.quality, ...changes }))

// Count settings for buildings reuse the geyser count modes.
function setPoiCount(mode, value) {
  const i = editPill.value.index
  const n = Math.max(0, Math.min(30, Math.round(Number(value) || 0)))
  update((f) => {
    const p = { type: f.pois[i].type, scope: f.pois[i].scope }
    if (mode === 'none') p.maxCount = 0
    else if (mode === 'at_most') p.maxCount = Math.max(1, n)
    else if (mode === 'exactly') Object.assign(p, { minCount: Math.max(1, n), maxCount: Math.max(1, n) })
    else p.minCount = Math.max(1, n)
    f.pois[i] = p
  })
}
const setPoiScope = (scope) => update((f) => (f.pois[editPill.value.index].scope = scope))
// Critters: same count modes, plus "within N tiles of the Printing Pod".
const editSpawn = computed(() => (['critter', 'plant'].includes(editPill.value?.kind) ? filter.value[editPill.value.list][editPill.value.index] : null))
function setSpawn(changes) {
  const { list, index: i } = editPill.value
  update((f) => {
    const c = { ...f[list][i], ...changes }
    for (const k of Object.keys(c)) if (c[k] === null || c[k] === undefined || c[k] === '') delete c[k]
    f[list][i] = c
  })
}
function setSpawnCount(mode, value) {
  const n = Math.max(0, Math.min(255, Math.round(Number(value) || 0)))
  if (mode === 'none') setSpawn({ minCount: null, maxCount: 0 })
  else if (mode === 'at_most') setSpawn({ minCount: null, maxCount: Math.max(1, n) })
  else if (mode === 'exactly') setSpawn({ minCount: Math.max(1, n), maxCount: Math.max(1, n) })
  else setSpawn({ minCount: Math.max(1, n), maxCount: null })
}
const setSpawnNear = (value) =>
  setSpawn(value === '' || value === null ? { maxDistance: null } : { maxDistance: Math.max(1, Math.min(1000, Math.round(Number(value) || 1))), scope: 'start' })
const setWorldDistance = (value) =>
  update((f) => (f.worlds[editPill.value.index].maxDistance = Math.max(0, Math.min(20, Math.round(Number(value) || 0)))))
const setTraitCount = (changes) =>
  update((f) => {
    const next = { ...f.traitCount, ...changes }
    for (const k of Object.keys(next)) if (next[k] === null || next[k] === '' || Number.isNaN(next[k])) delete next[k]
    f.traitCount = next
  })
function toggleBiomeSense(p) {
  update((f) => {
    const from = p.excluded ? 'exclude' : 'require'
    const to = p.excluded ? 'require' : 'exclude'
    f.biomes[from] = f.biomes[from].filter((x) => x !== p.id)
    f.biomes[to] = [...(f.biomes[to] ?? []), p.id]
  })
  editing.value = `${p.excluded ? 'b+' : 'b-'}${p.id}`
}
const setBiomeScope = (scope) => update((f) => (f.biomes.scope = scope))
const editPoi = computed(() => (editPill.value?.kind === 'poi' ? filter.value.pois[editPill.value.index] : null))
const editWorld = computed(() => (editPill.value?.kind === 'world' ? filter.value.worlds[editPill.value.index] : null))
const setNearPod = (value) => setGeyser(value === '' || value === null ? { maxDistance: null } : { maxDistance: Math.max(1, Math.min(1000, Math.round(Number(value) || 1))), scope: 'start' })

// ---- Picker ----------------------------------------------------------------

const picker = reactive({ open: false, tab: 'geysers', query: '', where: 'start' })
const TABS = ['geysers', 'traits', 'critters', 'distance', 'world', 'quality']

const query = computed(() => picker.query.trim().toLowerCase())
const matches = (text) => !query.value || text.toLowerCase().includes(query.value)

const geyserItems = computed(() =>
  (catalog.value?.geysers ?? [])
    .filter((g) => matches(`${g.name} ${g.id}`))
    .map((g) => ({
      ...g,
      icon: geyserInfo(g.id).icon,
      impossible: geyserImpossible(g.id, picker.where),
      added: (filter.value.geysers ?? []).some((x) => typesOf(x).length === 1 && typesOf(x)[0] === g.id && (x.scope ?? 'cluster') === picker.where),
    })),
)
const traitItems = computed(() =>
  (catalog.value?.traits ?? [])
    .filter((x) => matches(`${x.name} ${x.id}`))
    .map((x) => ({
      ...x,
      icon: traitInfo(x.id).icon,
      impossible: traitImpossible(x),
      added: [...(filter.value.traits?.require ?? []), ...(filter.value.traits?.exclude ?? [])].includes(x.id),
    })),
)
const qualityItems = computed(() =>
  [
    { id: 'above', rating: 0.5, share: 0.5 },
    { id: 'well_above', rating: 0.75, share: 0.4 },
  ].filter((q) => matches(t(`home.filters.quality_${q.id}`))),
)
// Distance: geysers near the Printing Pod, and asteroids near home on the
// starmap (Spaced Out clusters in range).
const nearPodItems = computed(() =>
  geyserItems.value.map((g) => ({
    ...g,
    impossible: geyserImpossible(g.id, 'start'),
    added: (filter.value.geysers ?? []).some((x) => typesOf(x).length === 1 && typesOf(x)[0] === g.id && x.maxDistance),
  })),
)
const asteroidItems = computed(() => {
  const ids = new Set()
  for (const p of eligible.value) {
    if (clusterMeta.value[p]?.gameMode !== 'spacedOut') continue
    for (const id of catalog.value?.asteroids?.[p] ?? []) ids.add(id)
  }
  return [...ids]
    .map((id) => ({ id, name: asteroidName(id), icon: asteroidInfo(id).icon, added: (filter.value.worlds ?? []).some((w) => w.world === id) }))
    .filter((a) => matches(`${a.name} ${a.id}`))
    .sort((a, b) => a.name.localeCompare(b.name))
})
const zoneItems = computed(() =>
  (catalog.value?.zones ?? [])
    .filter((z) => z.id !== 'Space' && matches(`${z.name} ${z.id}`))
    .map((z) => ({ ...z, icon: zoneInfo(z.id).icon, added: [...(filter.value.biomes?.require ?? []), ...(filter.value.biomes?.exclude ?? [])].includes(z.id) })),
)
const poiItems = computed(() =>
  (catalog.value?.pois ?? [])
    .filter((p) => p.id !== 'HeadquartersComplete' && matches(`${p.name} ${p.id}`))
    .map((p) => ({ ...p, icon: poiInfo(p.id).icon, added: (filter.value.pois ?? []).some((x) => x.type === p.id) })),
)
const critterItems = computed(() =>
  (catalog.value?.critters ?? [])
    .filter((c) => matches(`${c.name} ${c.id}`))
    .map((c) => ({ ...c, added: (filter.value.critters ?? []).some((x) => critterTypesOf(x).includes(c.id)) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
)
const plantItems = computed(() =>
  (catalog.value?.plants ?? [])
    .filter((c) => matches(`${c.name} ${c.id}`))
    .map((c) => ({ ...c, added: (filter.value.plants ?? []).some((x) => critterTypesOf(x).includes(c.id)) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
)
function addCritter(c, near = null) {
  addSpawn('critters', c ? { type: c.id } : { minCount: 30 }, near)
}
function addPlant(c, near = null) {
  addSpawn('plants', { type: c.id }, near)
}
// near: tiles from the Printing Pod (implies the starting asteroid).
function addSpawn(list, condition, near) {
  update((f) => {
    f[list] = [...(f[list] ?? []), near ? { ...condition, scope: 'start', maxDistance: near } : { ...condition, scope: picker.where }]
  })
}
const traitCountItems = computed(() =>
  [
    { id: 'none', value: { max: 0 } },
    { id: 'two', value: { min: 2 } },
    { id: 'three', value: { min: 3 } },
  ].filter((x) => matches(t(`home.filters.trait_count_${x.id}`))),
)

function addNearPod(g) {
  update((f) => {
    f.geysers = [...(f.geysers ?? []), { type: g.id, scope: 'start', maxDistance: 40 }]
  })
}
function addWorld(a) {
  update((f) => {
    f.worlds = [...(f.worlds ?? []), { world: a.id, maxDistance: 4 }]
  })
}
function addZone(z) {
  update((f) => {
    f.biomes = { scope: f.biomes?.scope ?? picker.where, require: [...(f.biomes?.require ?? []), z.id], exclude: f.biomes?.exclude ?? [] }
  })
}
function addPoi(p) {
  update((f) => {
    f.pois = [...(f.pois ?? []), { type: p.id, scope: picker.where }]
  })
}
function addTraitCount(x) {
  update((f) => {
    f.traitCount = { scope: picker.where, ...x.value }
  })
}

// Searching looks across every category.
const shownTabs = computed(() => (query.value ? TABS : [picker.tab]))

function addGeyser(g) {
  update((f) => {
    f.geysers = [...(f.geysers ?? []), { type: g.id, scope: picker.where }]
  })
}
function addTrait(x) {
  update((f) => {
    f.traits = { scope: f.traits?.scope ?? picker.where, require: [...(f.traits?.require ?? []), x.id], exclude: f.traits?.exclude ?? [] }
  })
}
function addQuality(q) {
  update((f) => {
    f.quality = { scope: picker.where === 'start' ? 'start' : 'cluster', minShare: q.share, minRating: q.rating }
  })
}

// Close popups on outside click and Escape.
const root = ref(null)
function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) {
    picker.open = false
    editing.value = null
  }
}
function onKey(e) {
  if (e.key === 'Escape') {
    picker.open = false
    editing.value = null
  }
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
watch(
  () => picker.open,
  (open) => {
    if (open) {
      editing.value = null
      loadCatalog()
    }
  },
)

const hasConditions = computed(() => pills.value.length > 0)
</script>

<template>
  <div ref="root" class="filter-builder">
    <div v-if="picker.open || editing" class="filter-backdrop" @click="picker.open = false; editing = null"></div>
    <div v-if="pills.length" class="d-flex flex-wrap align-items-center justify-content-center gap-2">
      <div v-for="p in pills" :key="p.key" class="pill-wrap">
        <button
          type="button"
          class="filter-pill"
          :class="{ meta: p.kind === 'meta', excluded: p.excluded, active: editing === p.key }"
          :title="p.title"
          @click.stop="editing = p.kind === 'meta' ? null : editing === p.key ? null : p.key; picker.open = false"
        >
          <img v-if="p.icon" :src="p.icon" alt="" class="pill-icon" />
          <span class="pill-text">
            <span>{{ p.label }}</span>
            <small v-if="p.sub" class="pill-sub">{{ p.sub }}</small>
          </span>
          <span class="pill-x" role="button" :aria-label="$t('home.filters.remove')" @click.stop="removePill(p)"><i class="bi bi-x-lg" aria-hidden="true"></i></span>
        </button>

        <!-- Editor for this pill -->
        <div v-if="editing === p.key" class="filter-pop editor" @click.stop>
          <template v-if="p.kind === 'geyser' && editGeyser">
            <div v-if="typesOf(editGeyser).length > 1" class="mb-2">
              <div class="pop-label">{{ $t('home.filters.any_of') }}</div>
              <span v-for="type in typesOf(editGeyser)" :key="type" class="type-chip">
                {{ geyserName(type) }}
                <button type="button" class="btn-link-x" :aria-label="$t('home.filters.remove')" @click="setTypes(typesOf(editGeyser).filter((x) => x !== type))"><i class="bi bi-x" aria-hidden="true"></i></button>
              </span>
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="countMode(editGeyser)" @change="setCount($event.target.value, countValue(editGeyser))">
                <option value="at_least">{{ $t('home.filters.at_least') }}</option>
                <option value="at_most">{{ $t('home.filters.at_most') }}</option>
                <option value="exactly">{{ $t('home.filters.exactly') }}</option>
                <option value="none">{{ $t('home.filters.none') }}</option>
              </select>
              <input
                v-if="countMode(editGeyser) !== 'none'"
                type="number"
                min="1"
                max="30"
                class="form-control form-control-sm num"
                :value="countValue(editGeyser)"
                @change="setCount(countMode(editGeyser), $event.target.value)"
              />
            </div>
            <div v-if="countMode(editGeyser) !== 'none'" class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.min_output') }}</label>
              <input
                type="number"
                min="0"
                class="form-control form-control-sm num-wide"
                :placeholder="catalog?.geysers.find((g) => g.id === typesOf(editGeyser)[0])?.typical ?? ''"
                :value="editGeyser.minAvgOutput ?? ''"
                @change="setGeyser({ minAvgOutput: $event.target.value ? Number($event.target.value) : null })"
              />
              <span class="small text-body-secondary">g/s</span>
            </div>
            <div v-if="countMode(editGeyser) !== 'none'" class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.within') }}</label>
              <input
                type="number"
                min="1"
                max="1000"
                class="form-control form-control-sm num"
                :placeholder="$t('home.filters.any')"
                :value="editGeyser.maxDistance ?? ''"
                @change="setNearPod($event.target.value)"
              />
              <span class="small text-body-secondary">{{ $t('home.filters.tiles_of_pod') }}</span>
            </div>
            <div v-if="!editGeyser.maxDistance" class="pop-row">
              <select class="form-select form-select-sm" :value="editGeyser.scope ?? 'cluster'" @change="setGeyser({ scope: $event.target.value })">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <template v-else-if="p.kind === 'poi' && editPoi">
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="countMode(editPoi)" @change="setPoiCount($event.target.value, countValue(editPoi))">
                <option value="at_least">{{ $t('home.filters.at_least') }}</option>
                <option value="at_most">{{ $t('home.filters.at_most') }}</option>
                <option value="exactly">{{ $t('home.filters.exactly') }}</option>
                <option value="none">{{ $t('home.filters.none') }}</option>
              </select>
              <input
                v-if="countMode(editPoi) !== 'none'"
                type="number"
                min="1"
                max="30"
                class="form-control form-control-sm num"
                :value="countValue(editPoi)"
                @change="setPoiCount(countMode(editPoi), $event.target.value)"
              />
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="editPoi.scope ?? 'cluster'" @change="setPoiScope($event.target.value)">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <template v-else-if="(p.kind === 'critter' || p.kind === 'plant') && editSpawn">
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="countMode(editSpawn)" @change="setSpawnCount($event.target.value, countValue(editSpawn))">
                <option value="at_least">{{ $t('home.filters.at_least') }}</option>
                <option value="at_most">{{ $t('home.filters.at_most') }}</option>
                <option value="exactly">{{ $t('home.filters.exactly') }}</option>
                <option value="none">{{ $t('home.filters.none') }}</option>
              </select>
              <input
                v-if="countMode(editSpawn) !== 'none'"
                type="number"
                min="1"
                max="255"
                class="form-control form-control-sm num"
                :value="countValue(editSpawn)"
                @change="setSpawnCount(countMode(editSpawn), $event.target.value)"
              />
            </div>
            <div class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.within') }}</label>
              <input type="number" min="1" max="1000" class="form-control form-control-sm num" :placeholder="$t('home.filters.any')" :value="editSpawn.maxDistance ?? ''" @change="setSpawnNear($event.target.value)" />
              <span class="small text-body-secondary">{{ $t('home.filters.tiles_of_pod') }}</span>
            </div>
            <div v-if="!editSpawn.maxDistance" class="pop-row">
              <select class="form-select form-select-sm" :value="editSpawn.scope ?? 'start'" @change="setSpawn({ scope: $event.target.value })">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <template v-else-if="p.kind === 'world' && editWorld">
            <div class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.within') }}</label>
              <input type="number" min="0" max="20" class="form-control form-control-sm num" :value="editWorld.maxDistance ?? ''" @change="setWorldDistance($event.target.value)" />
              <span class="small text-body-secondary">{{ $t('home.filters.hexes_of_home') }}</span>
            </div>
          </template>

          <template v-else-if="p.kind === 'biome'">
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="p.excluded ? 'no' : 'has'" @change="toggleBiomeSense(p)">
                <option value="has">{{ $t('home.filters.has_biome') }}</option>
                <option value="no">{{ $t('home.filters.no_biome') }}</option>
              </select>
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="filter.biomes?.scope ?? 'start'" @change="setBiomeScope($event.target.value)">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <template v-else-if="p.kind === 'traitCount' && filter.traitCount">
            <div class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.at_least') }}</label>
              <input type="number" min="0" max="12" class="form-control form-control-sm num" :value="filter.traitCount.min ?? ''" @change="setTraitCount({ min: $event.target.value === '' ? null : Number($event.target.value) })" />
              <label class="pop-label mb-0">{{ $t('home.filters.at_most') }}</label>
              <input type="number" min="0" max="12" class="form-control form-control-sm num" :value="filter.traitCount.max ?? ''" @change="setTraitCount({ max: $event.target.value === '' ? null : Number($event.target.value) })" />
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="filter.traitCount.scope ?? 'start'" @change="setTraitCount({ scope: $event.target.value })">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <template v-else-if="p.kind === 'trait'">
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="p.excluded ? 'no' : 'has'" @change="toggleTraitSense(p)">
                <option value="has">{{ $t('home.filters.has_trait') }}</option>
                <option value="no">{{ $t('home.filters.no_trait') }}</option>
              </select>
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="filter.traits?.scope ?? 'start'" @change="setTraitScope($event.target.value)">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
            <div class="small text-body-secondary">{{ $t('home.filters.traits_share_scope') }}</div>
          </template>

          <template v-else-if="p.kind === 'quality' && filter.quality">
            <div class="pop-row">
              <label class="pop-label mb-0">{{ $t('home.filters.at_least') }}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                class="form-control form-control-sm num"
                :value="Math.round(filter.quality.minShare * 100)"
                @change="setQuality({ minShare: Math.max(0, Math.min(100, Number($event.target.value) || 0)) / 100 })"
              />
              <span class="small">%</span>
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="(filter.quality.minRating ?? 0.5) > 0.5 ? 0.75 : 0.5" @change="setQuality({ minRating: Number($event.target.value) })">
                <option :value="0.5">{{ $t('home.filters.above') }}</option>
                <option :value="0.75">{{ $t('home.filters.well_above') }}</option>
              </select>
            </div>
            <div class="pop-row">
              <select class="form-select form-select-sm" :value="filter.quality.scope ?? 'cluster'" @change="setQuality({ scope: $event.target.value })">
                <option value="start">{{ $t('home.filters.on_start') }}</option>
                <option value="cluster">{{ $t('home.filters.in_cluster') }}</option>
              </select>
            </div>
          </template>

          <button type="button" class="btn btn-sm btn-outline-danger w-100 mt-1" @click="removePill(p)">{{ $t('home.filters.remove') }}</button>
        </div>
      </div>

    </div>

    <div class="d-flex flex-wrap align-items-center justify-content-center gap-2 mt-2">
      <!-- Add filter -->
      <div class="pill-wrap">
        <button type="button" class="btn btn-sm btn-outline-warning" :aria-expanded="picker.open" @click.stop="picker.open = !picker.open">
          <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ $t('home.filters.add') }}
        </button>
        <div v-if="picker.open" class="filter-pop picker" role="dialog" :aria-label="$t('home.filters.add')" @click.stop>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="pop-label mb-0">{{ $t('home.filters.applies_to') }}</span>
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn" :class="picker.where === 'start' ? 'btn-warning' : 'btn-outline-secondary'" @click="picker.where = 'start'">{{ $t('home.filters.start_short') }}</button>
              <button type="button" class="btn" :class="picker.where === 'cluster' ? 'btn-warning' : 'btn-outline-secondary'" @click="picker.where = 'cluster'">{{ $t('home.filters.cluster_short') }}</button>
            </div>
          </div>
          <div class="picker-tabs mb-2">
            <button v-for="tab in TABS" :key="tab" type="button" class="picker-tab" :class="{ active: picker.tab === tab && !query }" @click="picker.tab = tab; picker.query = ''">
              {{ $t(`home.filters.tabs.${tab}`) }}
            </button>
          </div>
          <input v-model="picker.query" type="search" class="form-control form-control-sm mb-2" :placeholder="$t('home.filters.search_all')" />

          <div class="picker-list">
            <div v-if="!catalog" class="text-body-secondary small p-2">{{ $t('home.filters.loading') }}</div>
            <template v-for="tab in shownTabs" :key="tab">
              <div v-if="query" class="picker-group">{{ $t(`home.filters.tabs.${tab}`) }}</div>
              <template v-if="tab === 'geysers'">
                <button
                  v-for="g in geyserItems"
                  :key="g.id"
                  type="button"
                  class="picker-item"
                  :class="{ impossible: g.impossible, added: g.added }"
                  @click="addGeyser(g)"
                >
                  <img v-if="g.icon" :src="g.icon" alt="" class="item-icon" />
                  <span class="item-name">{{ g.name }}<small>{{ g.id }}</small></span>
                  <span v-if="g.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                  <span v-else-if="g.impossible" class="item-tag">{{ $t('home.filters.impossible') }}</span>
                </button>
              </template>
              <template v-else-if="tab === 'traits'">
                <button
                  v-for="x in traitItems"
                  :key="x.id"
                  type="button"
                  class="picker-item"
                  :class="{ impossible: x.impossible, added: x.added }"
                  :disabled="x.added"
                  @click="addTrait(x)"
                >
                  <img v-if="x.icon" :src="x.icon" alt="" class="item-icon" />
                  <span class="item-name">{{ x.name }}<small>{{ x.id }}</small></span>
                  <span v-if="x.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                  <span v-else-if="x.impossible" class="item-tag">{{ $t('home.filters.impossible') }}</span>
                </button>
              </template>
              <template v-else-if="tab === 'critters'">
                <div class="picker-group">{{ $t('home.filters.critters_group') }}</div>
                <button v-if="matches($t('home.filters.critters_lots'))" type="button" class="picker-item" @click="addCritter(null)">
                  <i class="bi bi-bug item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ $t('home.filters.critters_lots') }}<small>{{ $t('home.filters.critters_lots_hint') }}</small></span>
                </button>
                <button v-for="c in critterItems" :key="`crit-${c.id}`" type="button" class="picker-item" :class="{ added: c.added }" @click="addCritter(c)">
                  <i class="bi bi-bug-fill item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ c.name }}<small>{{ c.id }}</small></span>
                  <span v-if="c.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                </button>
                <div class="picker-group">{{ $t('home.filters.plants_group') }}</div>
                <button v-for="c in plantItems" :key="`plant-${c.id}`" type="button" class="picker-item" :class="{ added: c.added }" @click="addPlant(c)">
                  <i class="bi bi-flower1 item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ c.name }}<small>{{ c.id }}</small></span>
                  <span v-if="c.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                </button>
                <div class="small text-body-secondary px-2 mt-2">{{ $t('home.filters.critters_note', { n: (catalog?.critterWorlds ?? 0).toLocaleString() }) }}</div>
              </template>
              <template v-else-if="tab === 'distance'">
                <div class="picker-group">{{ $t('home.filters.near_pod_group') }}</div>
                <button v-for="g in nearPodItems" :key="`pod-${g.id}`" type="button" class="picker-item" :class="{ impossible: g.impossible, added: g.added }" @click="addNearPod(g)">
                  <img v-if="g.icon" :src="g.icon" alt="" class="item-icon" />
                  <span class="item-name">{{ g.name }}<small>{{ $t('home.filters.near_pod_hint') }}</small></span>
                  <span v-if="g.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                  <span v-else-if="g.impossible" class="item-tag">{{ $t('home.filters.impossible') }}</span>
                </button>
                <div class="picker-group">{{ $t('home.filters.critters_near_pod_group') }}</div>
                <button v-for="c in critterItems" :key="`podc-${c.id}`" type="button" class="picker-item" @click="addCritter(c, 40)">
                  <i class="bi bi-bug-fill item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ c.name }}<small>{{ $t('home.filters.near_pod_hint') }}</small></span>
                </button>
                <div class="picker-group">{{ $t('home.filters.plants_near_pod_group') }}</div>
                <button v-for="c in plantItems" :key="`podp-${c.id}`" type="button" class="picker-item" @click="addPlant(c, 40)">
                  <i class="bi bi-flower1 item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ c.name }}<small>{{ $t('home.filters.near_pod_hint') }}</small></span>
                </button>
                <div class="picker-group">{{ $t('home.filters.near_home_group') }}</div>
                <div v-if="!asteroidItems.length" class="small text-body-secondary px-2">{{ $t('home.filters.spaced_out_only') }}</div>
                <button v-for="a in asteroidItems" :key="`ast-${a.id}`" type="button" class="picker-item" :class="{ added: a.added }" :disabled="a.added" @click="addWorld(a)">
                  <img v-if="a.icon" :src="a.icon" alt="" class="item-icon" />
                  <i v-else class="bi bi-circle item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ a.name }}<small>{{ $t('home.filters.near_home_hint') }}</small></span>
                  <span v-if="a.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                </button>
              </template>
              <template v-else-if="tab === 'world'">
                <div class="picker-group">{{ $t('home.filters.biomes_group') }}</div>
                <button v-for="z in zoneItems" :key="`zone-${z.id}`" type="button" class="picker-item" :class="{ added: z.added }" :disabled="z.added" @click="addZone(z)">
                  <img v-if="z.icon" :src="z.icon" alt="" class="item-icon" />
                  <span class="item-name">{{ z.name }}<small>{{ $t('home.filters.biome_hint') }}</small></span>
                  <span v-if="z.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                </button>
                <div class="picker-group">{{ $t('home.filters.buildings_group') }}</div>
                <button v-for="b in poiItems" :key="`poi-${b.id}`" type="button" class="picker-item" :class="{ added: b.added }" @click="addPoi(b)">
                  <img v-if="b.icon" :src="b.icon" alt="" class="item-icon" />
                  <i v-else class="bi bi-building item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ b.name }}<small>{{ b.id }}</small></span>
                  <span v-if="b.added" class="item-tag ok"><i class="bi bi-check2" aria-hidden="true"></i></span>
                </button>
                <div class="picker-group">{{ $t('home.filters.trait_count_group') }}</div>
                <button v-for="x in traitCountItems" :key="`tc-${x.id}`" type="button" class="picker-item" @click="addTraitCount(x)">
                  <i class="bi bi-hash item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ $t(`home.filters.trait_count_${x.id}`) }}</span>
                </button>
                <div class="small text-body-secondary px-2 mt-2">{{ $t('home.filters.new_worlds_only') }}</div>
              </template>
              <template v-else>
                <button v-for="q in qualityItems" :key="q.id" type="button" class="picker-item" @click="addQuality(q)">
                  <i class="bi bi-stars item-icon-i" aria-hidden="true"></i>
                  <span class="item-name">{{ $t(`home.filters.quality_${q.id}`) }}<small>{{ $t('home.filters.quality_hint') }}</small></span>
                </button>
              </template>
            </template>
          </div>
          <div class="picker-foot">{{ $t('home.filters.defaults_hint') }}</div>
        </div>
      </div>

      <button v-if="hasConditions" type="button" class="btn btn-sm btn-warning" :disabled="busy" @click="emit('search', clone(filter))">
        <i class="bi bi-search me-1" aria-hidden="true"></i>{{ $t('home.filters.search') }}
      </button>
      <button v-if="hasConditions" type="button" class="btn btn-sm btn-link text-body-secondary" @click="emit('update:modelValue', null)">
        {{ $t('home.filters.clear') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-builder {
  margin-top: 0.75rem;
}
.pill-wrap {
  position: relative;
}
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--bs-warning-border-subtle, #997404);
  background: rgba(255, 193, 7, 0.08);
  color: var(--bs-body-color);
  border-radius: 999px;
  padding: 0.2rem 0.35rem 0.2rem 0.5rem;
  font-size: 0.85rem;
  line-height: 1.1;
  text-align: left;
}
.filter-pill.meta {
  border-color: var(--bs-border-color);
  background: transparent;
  cursor: default;
}
.filter-pill.excluded {
  border-color: rgba(220, 53, 69, 0.6);
  background: rgba(220, 53, 69, 0.08);
}
.filter-pill.active {
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.4);
}
.pill-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.pill-text {
  display: inline-flex;
  flex-direction: column;
}
.pill-sub {
  font-size: 0.7rem;
  color: var(--bs-secondary-color);
}
.pill-x {
  padding: 0 0.35rem;
  font-size: 1rem;
  color: var(--bs-secondary-color);
  cursor: pointer;
}
.pill-x:hover {
  color: var(--bs-danger);
}
.filter-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1040;
  background: rgba(0, 0, 0, 0.45);
}
/* Dialogs open in the middle of the screen, whatever opened them. */
.filter-pop {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  z-index: 1050;
  background: var(--bs-body-bg, #212529);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.6rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  padding: 0.75rem;
}
.filter-pop.editor {
  width: min(300px, calc(100vw - 32px));
}
.filter-pop.picker {
  width: min(460px, calc(100vw - 32px));
}
.pop-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.pop-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}
.num {
  width: 72px;
}
.num-wide {
  width: 96px;
}
.type-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  padding: 0 0.15rem 0 0.5rem;
  margin: 0 0.25rem 0.25rem 0;
}
.btn-link-x {
  background: none;
  border: 0;
  color: var(--bs-secondary-color);
  padding: 0 0.3rem;
}
.picker-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--bs-border-color);
}
.picker-tab {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--bs-secondary-color);
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
}
.picker-tab.active {
  color: var(--bs-body-color);
  border-bottom-color: var(--bs-warning);
}
.picker-list {
  max-height: 320px;
  overflow-y: auto;
}
.picker-group {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--bs-secondary-color);
  margin: 0.5rem 0 0.2rem;
}
.picker-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: none;
  border: 0;
  border-radius: 0.4rem;
  padding: 0.3rem 0.4rem;
  color: var(--bs-body-color);
  text-align: left;
}
.picker-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
}
.picker-item.impossible {
  opacity: 0.5;
}
.item-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex: none;
}
.item-icon-i {
  width: 28px;
  text-align: center;
  font-size: 1.1rem;
  color: var(--bs-warning);
}
.item-name {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.item-name small {
  font-size: 0.7rem;
  color: var(--bs-secondary-color);
}
.item-tag {
  font-size: 0.7rem;
  color: var(--bs-secondary-color);
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  padding: 0 0.4rem;
}
.item-tag.ok {
  color: var(--bs-success);
  border-color: transparent;
}
@media (max-width: 575.98px) {
  .picker-list {
    max-height: 55vh;
  }
}
.picker-foot {
  font-size: 0.72rem;
  color: var(--bs-secondary-color);
  margin-top: 0.5rem;
}
</style>
