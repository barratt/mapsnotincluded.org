<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SPACE_BACKGROUND, geyserInfo, geyserRating, poiInfo, zoneInfo } from '@/oniCatalog'
import { usePanZoom } from '@/composables/usePanZoom'
import GeyserBadge from './GeyserBadge.vue'
import GeyserStats from './GeyserStats.vue'

// Biome polygons with geyser and POI markers for one asteroid. Game
// coordinates have y pointing up; everything here is flipped once into SVG
// space (y down) and then drawn inside a pan/zoom transform. Markers are HTML
// buttons on top so they stay the same size and are keyboard focusable.
const props = defineProps({
  asteroid: { type: Object, required: true },
  selected: { type: String, default: null },
  highlightZone: { type: String, default: null },
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

// Optional future layer: asteroid.tiles = { width, height, palette: ['#rrggbb', ...],
// data: base64 string with one palette index byte per cell, bottom row first }.
// When present it is drawn underneath and the biome polygons become outlines.
const tileUrl = computed(() => {
  const tiles = props.asteroid.tiles
  if (!tiles?.data || !tiles.palette || typeof document === 'undefined') return null
  try {
    const bytes = Uint8Array.from(atob(tiles.data), (c) => c.charCodeAt(0))
    const canvas = document.createElement('canvas')
    canvas.width = tiles.width
    canvas.height = tiles.height
    const ctx = canvas.getContext('2d')
    const image = ctx.createImageData(tiles.width, tiles.height)
    const rgb = tiles.palette.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)))
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        const colour = rgb[bytes[y * tiles.width + x]] ?? [0, 0, 0]
        const o = ((tiles.height - 1 - y) * tiles.width + x) * 4
        image.data.set([...colour, 255], o)
      }
    }
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL()
  } catch {
    return null
  }
})

const markers = computed(() => [
  ...(props.asteroid.geysers ?? [])
    .map((g, i) => {
      const info = geyserInfo(g.type, g.name)
      return { key: `g${i}`, kind: 'geyser', x: g.x, y: flipY(g.y), icon: info.icon, label: info.label, rating: geyserRating(g), data: g }
    })
    .filter((m) => m.data.x != null && m.data.y != null),
  ...(props.asteroid.pois ?? [])
    .map((p, i) => {
      const info = poiInfo(p.type, p.name)
      return { key: `p${i}`, kind: 'poi', x: p.x, y: flipY(p.y), icon: info.icon, label: info.label, data: p }
    })
    .filter((m) => m.data.x != null && m.data.y != null),
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
        @click.self="!pz.moved.value && emit('update:selected', null)"
      >
        <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="map-svg" aria-hidden="true" @click="!pz.moved.value && emit('update:selected', null)">
          <g :transform="pz.transform.value">
            <image v-if="tileUrl" :href="tileUrl" x="0" y="0" :width="width" :height="height" preserveAspectRatio="none" class="map-tiles" />
            <path
              v-for="biome in biomePaths"
              :key="biome.zone"
              :d="biome.d"
              :fill="highlightZone && highlightZone !== biome.zone ? 'var(--sb-dimmed)' : biome.color"
              :fill-opacity="tileUrl ? 0.15 : 1"
              class="map-biome"
              :class="{ highlighted: highlightZone === biome.zone }"
              @pointerenter="hoveredZone = biome.name"
              @pointerleave="hoveredZone = null"
            />
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

        <div v-if="hoveredZone && !tip" class="map-zone-chip">{{ hoveredZone }}</div>
        <div v-if="!biomePaths.length" class="map-empty">{{ $t('world.map.no_biomes') }}</div>
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
    <p class="map-hint">{{ $t('world.map.hint') }}</p>
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
