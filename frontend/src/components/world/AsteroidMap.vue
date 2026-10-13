<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SPACE_BACKGROUND, geyserInfo, geyserRating, poiInfo, zoneInfo } from '@/oniCatalog'
import { usePanZoom } from '@/composables/usePanZoom'
import { cellInfo, elementTable, formatMass, formatTemperature, paintTiles } from '@/worldTiles'
import GeyserBadge from './GeyserBadge.vue'
import GeyserStats from './GeyserStats.vue'
import { spawnableInfo } from '@/data/spawnables'

// One asteroid: every tile (when the detail has tile data) or the biome
// polygons, with geyser, POI and spawn markers. Game coordinates have y
// pointing up; everything here is flipped once into SVG space (y down) and
// then drawn inside a pan/zoom transform. The tiles are painted once per view
// mode into a canvas (ImageData) and shown as a pixelated SVG image, so pan
// and zoom never repaint them. Markers are HTML buttons on top so they stay
// the same size and are keyboard focusable.
const props = defineProps({
  asteroid: { type: Object, required: true },
  // detail.tiles: element and disease tables for asteroid.tileData.
  tiles: { type: Object, default: null },
  selected: { type: String, default: null },
  highlightZone: { type: String, default: null },
  highlightElement: { type: Number, default: null },
  // Prefab id picked in the critter summary: only those are drawn, larger.
  highlightSpawn: { type: String, default: null },
})
const emit = defineEmits(['update:selected'])
const { t } = useI18n()

const viewport = ref(null)
const width = computed(() => props.asteroid.sizeX || 256)
const height = computed(() => props.asteroid.sizeY || 384)
const flipY = (y) => height.value - y

const pz = usePanZoom(viewport, () => ({ width: width.value, height: height.value }), { maxZoom: 12 })
watch(
  () => props.asteroid,
  () => pz.reset(),
)

const biomePaths = computed(() =>
  (props.asteroid.biomes ?? []).map((biome) => {
    const info = zoneInfo(biome.zone)
    const d = (biome.polygons ?? [])
      .filter((poly) => poly.length > 2)
      .map((poly) => 'M' + poly.map(([x, y]) => `${x} ${flipY(y)}`).join('L') + 'Z')
      .join('')
    return { zone: info.id, name: biome.name || info.label, color: info.color, d }
  }),
)

// Tile layer. view: 'elements' | 'temperature' | 'biomes' (polygons only).
const hasTiles = computed(() => Boolean(props.asteroid.tileData))
// Biomes first: the clearest overview of a new world.
const view = ref('biomes')
const showBiomes = ref(true)
// Picking an element in the legend highlights it on the element map.
watch(
  () => props.highlightElement,
  (id) => {
    if (id != null && view.value === 'biomes' && hasTiles.value) view.value = 'elements'
  },
)
const table = computed(() => elementTable(props.tiles))
const tileUrl = computed(() => {
  const data = props.asteroid.tileData
  if (!data || view.value === 'biomes' || typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = data.width
    canvas.height = data.height
    const ctx = canvas.getContext('2d')
    const image = ctx.createImageData(data.width, data.height)
    paintTiles(data, table.value, view.value, props.highlightElement, image.data)
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL()
  } catch {
    return null
  }
})
const biomeFill = (biome) => {
  if (props.highlightZone && props.highlightZone !== biome.zone) return tileUrl.value ? 'rgba(0, 0, 0, 0.55)' : 'var(--sb-dimmed)'
  return tileUrl.value ? 'none' : biome.color
}

// Ambient spawns (critters, plants, seeds) placed once the world has settled,
// coloured by kind. Critters are drawn largest so they stand out; loose seeds
// are only drawn when picked in the critter summary.
const SPAWN_RADIUS = { critter: 1.2, plant: 0.6, seed: 0.45, other: 0.5 }
// Off at first: the map starts uncluttered (picking one in the critter
// summary still shows where it is).
const showAmbient = ref(false)
const ambient = computed(() =>
  (props.asteroid.ambient ?? []).map((a) => {
    const info = spawnableInfo(a.id)
    return { ...a, ...info, id: a.id, r: SPAWN_RADIUS[info.kind] }
  }),
)
const ambientDefault = computed(() => ambient.value.filter((a) => a.kind !== 'seed'))
const ambientShown = computed(() => {
  if (props.highlightSpawn) return ambient.value.filter((a) => a.id === props.highlightSpawn).map((a) => ({ ...a, r: 1.6 }))
  return showAmbient.value ? ambientDefault.value : []
})
const ambientByCell = computed(() => {
  const byCell = new Map()
  for (const a of ambientShown.value) {
    const key = a.y * width.value + a.x
    byCell.set(key, [...(byCell.get(key) ?? []), a])
  }
  return byCell
})

// The spawns nearest the pointer, within about 10 screen pixels, so
// single-tile critters can be hovered at any zoom.
function nearestSpawn(x, y, cellsPerPixel) {
  const reach = Math.max(1, Math.ceil(10 * cellsPerPixel))
  let best = null
  let bestD = Infinity
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const here = ambientByCell.value.get((y + dy) * width.value + (x + dx))
      if (!here) continue
      const d = dx * dx + dy * dy
      if (d < bestD) [best, bestD] = [here, d]
    }
  }
  return best
}
const hoverSpawn = ref(null)

// Hovered cell: client position -> viewBox -> map (undo the pan/zoom) -> grid.
const hoverCell = ref(null)
function onPointerMove(event) {
  const data = props.asteroid.tileData
  if (!data || !viewport.value || event.pointerType === 'touch') return
  const rect = viewport.value.getBoundingClientRect()
  const vx = ((event.clientX - rect.left) / rect.width) * width.value
  const vy = ((event.clientY - rect.top) / rect.height) * height.value
  const x = Math.floor((vx - pz.tx.value) / pz.k.value)
  const y = Math.floor(height.value - (vy - pz.ty.value) / pz.k.value)
  hoverCell.value = cellInfo(data, table.value, props.tiles?.diseases, x, y)
  const cellsPerPixel = width.value / rect.width / pz.k.value
  const spawns = ambientShown.value.length ? nearestSpawn(x, y, cellsPerPixel) : null
  hoverSpawn.value = spawns
    ? { x: spawns[0].x, y: spawns[0].y, color: spawns[0].color, names: [...new Set(spawns.map((a) => a.name))], kind: spawns[0].kind }
    : null
}
function onPointerLeave() {
  hoverCell.value = null
  hoverSpawn.value = null
}
watch(
  () => props.asteroid,
  () => onPointerLeave(),
)

// Markers sit on the centre of their cell, like the spawn dots (a cell's
// game (x, y) is its bottom-left corner).
const markers = computed(() => [
  ...(props.asteroid.geysers ?? [])
    .map((g, i) => {
      const info = geyserInfo(g.type, g.name)
      return { key: `g${i}`, kind: 'geyser', x: g.x + 0.5, y: flipY(g.y) - 0.5, icon: info.icon, label: info.label, rating: geyserRating(g), data: g }
    })
    .filter((m) => m.data.x != null && m.data.y != null),
  ...(props.asteroid.pois ?? [])
    .map((p, i) => {
      const info = poiInfo(p.type, p.name)
      return { key: `p${i}`, kind: 'poi', x: p.x + 0.5, y: flipY(p.y) - 0.5, icon: info.icon, label: info.label, data: p }
    })
    .filter((m) => m.data.x != null && m.data.y != null),
  // Where the Printing Pod prints the first Duplicants.
  // Only the starting asteroid has the Printing Pod (older cached maps carry
  // a start position for every world with a start template).
  ...(props.asteroid.spawn && props.asteroid.start
    ? [{ key: 'spawn', kind: 'spawn', x: props.asteroid.spawn.x + 0.5, y: flipY(props.asteroid.spawn.y) - 0.5, label: t('world.tiles.spawn'), data: props.asteroid.spawn }]
    : []),
])

const hovered = ref(null)
const focused = ref(null)
const hoveredZone = ref(null)
const tipKey = computed(() => hovered.value ?? focused.value ?? props.selected)
const tip = computed(() => markers.value.find((m) => m.key === tipKey.value) ?? null)

function tipStyle(marker) {
  const pos = pz.toPercent(marker.x, marker.y)
  const left = parseFloat(pos.left)
  const top = parseFloat(pos.top)
  const style = { left: pos.left, top: pos.top }
  const tx = left < 30 ? '-12%' : left > 70 ? '-88%' : '-50%'
  const ty = top < 45 ? '22px' : 'calc(-100% - 22px)'
  style.transform = `translate(${tx}, ${ty})`
  return style
}

function markerClick(marker) {
  if (pz.moved.value) return
  emit('update:selected', props.selected === marker.key ? null : marker.key)
}

function markerLabel(marker) {
  const where = t('world.position', { x: marker.data.x, y: marker.data.y })
  if (marker.kind === 'geyser' && marker.data.avgOutput != null) return `${marker.label}, ${marker.data.avgOutput} g/s, ${where}`
  return `${marker.label}, ${where}`
}

// Bring a marker picked from the tables into view when the map is zoomed in.
watch(
  () => props.selected,
  (key) => {
    const marker = markers.value.find((m) => m.key === key)
    if (marker && pz.k.value > 1) pz.focusOn(marker.x, marker.y, pz.k.value)
  },
)

const frameStyle = computed(() => {
  const ratio = width.value / height.value
  return {
    aspectRatio: `${width.value} / ${height.value}`,
    width: `min(100%, ${(78 * ratio).toFixed(2)}vh)`,
    backgroundImage: `url(${SPACE_BACKGROUND})`,
  }
})
</script>

<template>
  <div class="asteroid-map">
    <div class="map-frame" :style="frameStyle">
      <div
        ref="viewport"
        class="map-viewport"
        tabindex="0"
        role="application"
        :aria-label="$t('world.map.aria', { name: asteroid.name })"
        :style="{ touchAction: pz.touchAction.value }"
        v-on="pz.handlers"
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
        @click.self="!pz.moved.value && emit('update:selected', null)"
      >
        <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="map-svg" aria-hidden="true" @click="!pz.moved.value && emit('update:selected', null)">
          <g :transform="pz.transform.value">
            <image v-if="tileUrl" :href="tileUrl" x="0" y="0" :width="width" :height="height" preserveAspectRatio="none" class="map-tiles" />
            <path
              v-for="biome in tileUrl && !showBiomes && !highlightZone ? [] : biomePaths"
              :key="biome.zone"
              :d="biome.d"
              :fill="biomeFill(biome)"
              class="map-biome"
              :class="{ highlighted: highlightZone === biome.zone, 'over-tiles': tileUrl, 'no-outline': tileUrl && !showBiomes }"
              @pointerenter="hoveredZone = biome.name"
              @pointerleave="hoveredZone = null"
            />
            <g v-if="ambientShown.length" class="map-ambient" :class="{ highlighting: highlightSpawn }">
              <circle v-for="(a, i) in ambientShown" :key="i" :cx="a.x + 0.5" :cy="flipY(a.y) - 0.5" :r="a.r" :fill="a.color" />
              <circle v-if="hoverSpawn" class="spawn-hover" :cx="hoverSpawn.x + 0.5" :cy="flipY(hoverSpawn.y) - 0.5" r="2.2" />
            </g>
            <rect x="0" y="0" :width="width" :height="height" class="map-outline" />
          </g>
        </svg>

        <button
          v-for="marker in markers"
          :key="marker.key"
          type="button"
          class="map-marker"
          :class="[`marker-${marker.kind}`, { active: tipKey === marker.key, selected: selected === marker.key }]"
          :style="pz.toPercent(marker.x, marker.y)"
          :aria-label="markerLabel(marker)"
          :aria-pressed="selected === marker.key"
          @click.stop="markerClick(marker)"
          @mouseenter="hovered = marker.key"
          @mouseleave="hovered = null"
          @focus="focused = marker.key"
          @blur="focused = null"
        >
          <GeyserBadge v-if="marker.kind === 'geyser'" :icon="marker.icon" :rating="marker.rating" :size="28" />
          <span v-else-if="marker.kind === 'spawn'" class="spawn-ring"><i class="bi bi-person-fill" aria-hidden="true"></i></span>
          <span v-else class="poi-dot"><img v-if="marker.icon" :src="marker.icon" alt="" /><i v-else class="bi bi-geo-alt-fill"></i></span>
        </button>

        <div v-if="tip" class="map-tooltip" :style="tipStyle(tip)" role="status">
          <GeyserStats v-if="tip.kind === 'geyser'" :geyser="tip.data" />
          <div v-else class="d-flex align-items-center gap-2">
            <img v-if="tip.icon" :src="tip.icon" alt="" class="tip-icon" />
            <div class="lh-sm">
              <div class="fw-bold">{{ tip.label }}</div>
              <div class="small text-body-secondary">{{ $t('world.position', { x: tip.data.x, y: tip.data.y }) }}</div>
            </div>
          </div>
        </div>

        <div v-if="(hoverCell || hoverSpawn) && !tip" class="map-cell-info" role="status">
          <div v-if="hoverSpawn" class="spawn-tip">
            <span class="spawn-tip-dot" :style="{ background: hoverSpawn.color }"></span>
            <span>
              <span class="fw-bold">{{ hoverSpawn.names.join(', ') }}</span>
              <span class="d-block small text-body-secondary">
                {{ $t(`world.critters.kind_one.${hoverSpawn.kind}`) }} · {{ $t('world.position', { x: hoverSpawn.x, y: hoverSpawn.y }) }}
              </span>
            </span>
          </div>
          <template v-if="hoverCell">
            <div class="fw-bold">{{ hoverCell.element }}</div>
          <div v-if="hoverCell.state !== 'v'" class="small">
            {{ formatMass(hoverCell.mass) }} · {{ formatTemperature(hoverCell.temperature) }}
          </div>
          <div v-if="hoverCell.germ" class="small">{{ $t('world.tiles.germs', { n: hoverCell.germCount.toLocaleString(), name: hoverCell.germ }) }}</div>
          <div class="small text-body-secondary">
            {{ $t('world.position', { x: hoverCell.x, y: hoverCell.y }) }}<template v-if="hoveredZone"> · {{ hoveredZone }}</template>
          </div>
          </template>
        </div>
        <div v-else-if="hoveredZone && !tip" class="map-zone-chip">{{ hoveredZone }}</div>
        <div v-if="!biomePaths.length && !hasTiles" class="map-empty">{{ $t('world.map.no_biomes') }}</div>
      </div>

      <div class="map-controls" role="group" :aria-label="$t('world.map.controls')">
        <button type="button" class="btn btn-sm btn-dark" :title="$t('world.map.zoom_in')" :aria-label="$t('world.map.zoom_in')" @click="pz.zoomAt(1.5)">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button type="button" class="btn btn-sm btn-dark" :title="$t('world.map.zoom_out')" :aria-label="$t('world.map.zoom_out')" @click="pz.zoomAt(1 / 1.5)">
          <i class="bi bi-dash-lg"></i>
        </button>
        <button type="button" class="btn btn-sm btn-dark" :title="$t('world.map.reset')" :aria-label="$t('world.map.reset')" :disabled="pz.k.value === 1" @click="pz.reset()">
          <i class="bi bi-arrows-angle-contract"></i>
        </button>
      </div>
    </div>
    <div v-if="hasTiles" class="map-views" role="group" :aria-label="$t('world.tiles.view')">
      <div class="btn-group btn-group-sm">
        <button
          v-for="mode in ['elements', 'temperature', 'biomes']"
          :key="mode"
          type="button"
          class="btn btn-outline-light"
          :class="{ active: view === mode }"
          :aria-pressed="view === mode"
          @click="view = mode"
        >
          {{ $t(`world.tiles.views.${mode}`) }}
        </button>
      </div>
      <div class="map-toggles">
        <div v-if="view !== 'biomes'" class="form-check form-switch mb-0">
          <input id="map-biome-outlines" v-model="showBiomes" class="form-check-input" type="checkbox" />
          <label class="form-check-label" for="map-biome-outlines">{{ $t('world.tiles.biome_outlines') }}</label>
        </div>
        <div v-if="ambientDefault.length" class="form-check form-switch mb-0">
          <input id="map-ambient" v-model="showAmbient" class="form-check-input" type="checkbox" />
          <label class="form-check-label" for="map-ambient">{{ $t('world.tiles.ambient', { n: ambientDefault.length }) }}</label>
        </div>
      </div>
    </div>
    <p class="map-hint">{{ $t(hasTiles ? 'world.tiles.hint' : 'world.map.hint') }}</p>
  </div>
</template>

<style scoped>
.asteroid-map {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.map-frame {
  position: relative;
  max-width: 100%;
  border: 1px solid var(--sb-border);
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.map-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  outline: none;
}
.map-viewport:active {
  cursor: grabbing;
}
.map-viewport:focus-visible {
  box-shadow: inset 0 0 0 2px var(--sb-hover);
}
.map-svg {
  display: block;
  width: 100%;
  height: 100%;
}
.map-tiles {
  image-rendering: pixelated;
}
.map-biome {
  stroke: rgba(0, 0, 0, 0.18);
  stroke-width: 0.6px;
  vector-effect: non-scaling-stroke;
  transition: fill 0.15s;
}
.map-biome.over-tiles {
  stroke: rgba(255, 255, 255, 0.45);
  stroke-width: 1px;
  pointer-events: all;
}
.map-biome.over-tiles.highlighted {
  stroke: var(--sb-hover);
  stroke-width: 2px;
}
.map-ambient circle {
  stroke: rgba(0, 0, 0, 0.7);
  stroke-width: 0.2;
  pointer-events: none;
}
.map-ambient.highlighting circle {
  stroke: #fff;
  stroke-width: 0.35;
}
.map-ambient .spawn-hover {
  fill: none;
  stroke: #fff;
  stroke-width: 1.5px;
  vector-effect: non-scaling-stroke;
}
.spawn-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-bottom: 0.25rem;
}
.spawn-tip-dot {
  width: 10px;
  height: 10px;
  margin-top: 0.4rem;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6);
  flex: none;
}
.map-biome.no-outline {
  stroke: none;
}
.spawn-ring {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--sb-hover);
  background: rgba(34, 37, 41, 0.6);
  color: var(--sb-hover);
  font-size: 0.9rem;
  box-shadow: 0 0 0 3px rgba(255, 235, 59, 0.25);
  animation: spawn-pulse 2s ease-in-out infinite;
}
@keyframes spawn-pulse {
  50% {
    box-shadow: 0 0 0 7px rgba(255, 235, 59, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spawn-ring {
    animation: none;
  }
}
.map-cell-info {
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 4;
  min-width: 9rem;
  padding: 0.3rem 0.55rem;
  border: 1px solid var(--sb-border);
  border-radius: 6px;
  background: rgba(34, 37, 41, 0.9);
  font-size: 1rem;
  line-height: 1.25;
  pointer-events: none;
}
.map-views {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
}
.map-toggles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem 1.25rem;
}
.map-outline {
  fill: none;
  stroke: var(--sb-border);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.map-marker {
  --marker: 28px;
  position: absolute;
  width: var(--marker);
  height: var(--marker);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  transform: translate(-50%, -50%);
  line-height: 0;
  cursor: pointer;
  z-index: 1;
}
.map-marker :deep(.geyser-badge) {
  width: 100%;
  height: 100%;
}
.map-marker:focus-visible,
.map-marker.selected {
  outline: 2px solid var(--sb-hover);
  outline-offset: 1px;
  z-index: 3;
}
.map-marker.active {
  z-index: 3;
}
.poi-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(34, 37, 41, 0.75);
  border: 1px solid rgba(242, 242, 242, 0.45);
}
.poi-dot img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}
.map-tooltip {
  position: absolute;
  z-index: 5;
  max-width: min(21rem, 92%);
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--sb-border);
  border-radius: 8px;
  background: rgba(34, 37, 41, 0.94);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  font-size: 1.05rem;
  pointer-events: none;
}
.tip-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.map-zone-chip {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 0 0.5rem;
  border-radius: 4px;
  background: rgba(34, 37, 41, 0.85);
  font-size: 1rem;
  pointer-events: none;
}
.map-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: var(--sb-muted);
  pointer-events: none;
}
.map-controls {
  position: absolute;
  right: 6px;
  top: 6px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.map-controls .btn {
  width: 32px;
  height: 32px;
  padding: 0;
  line-height: 1;
  background: rgba(34, 37, 41, 0.85);
  border-color: var(--sb-border);
}
.map-hint {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: var(--sb-muted);
  text-align: center;
}
@media (max-width: 575.98px) {
  .map-marker {
    --marker: 24px;
  }
}
</style>
