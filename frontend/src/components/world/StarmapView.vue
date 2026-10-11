<script setup>
import { computed, ref } from 'vue'
import { SPACE_BACKGROUND, shortId, starmapEntryInfo } from '@/oniCatalog'
import { usePanZoom } from '@/composables/usePanZoom'

// Spaced Out hex starmap (axial q/r coordinates, flat-topped hexes as in the
// seed browser). Asteroid entries select that asteroid on the page.
const props = defineProps({
  starmap: { type: Object, required: true },
  asteroids: { type: Array, default: () => [] },
  selected: { type: Number, default: 0 },
})
const emit = defineEmits(['select-asteroid'])

const SQRT3 = Math.sqrt(3)
const hexDistance = (q, r) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2

const asteroidIndex = computed(() => {
  const map = new Map()
  props.asteroids.forEach((a, i) => map.set(shortId(a.id), i))
  return map
})

const entries = computed(() =>
  (props.starmap.entries ?? []).map((e, i) => {
    const info = starmapEntryInfo(e.id, e.name)
    const index = asteroidIndex.value.get(info.id)
    return { ...e, key: i, info, index, distance: hexDistance(e.q, e.r) }
  }),
)

const radius = computed(() => props.starmap.radius ?? Math.max(3, ...entries.value.map((e) => e.distance)))
const extentX = computed(() => 1.5 * radius.value + 1.2)
const extentY = computed(() => SQRT3 * (radius.value + 0.6))
const size = () => ({ width: extentX.value * 2, height: extentY.value * 2 })

const center = (q, r) => [extentX.value + 1.5 * q, extentY.value + SQRT3 * (r + q / 2)]
const hexPoints = (cx, cy, s = 1) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + s * Math.cos(a)).toFixed(3)},${(cy + s * Math.sin(a)).toFixed(3)}`
  }).join(' ')

const grid = computed(() => {
  const R = radius.value
  const cells = []
  for (let q = -R; q <= R; q++) {
    for (let r = Math.max(-R, -q - R); r <= Math.min(R, -q + R); r++) {
      const [x, y] = center(q, r)
      cells.push(hexPoints(x, y, 0.97))
    }
  }
  return cells
})

const placed = computed(() =>
  entries.value.map((e) => {
    const [x, y] = center(e.q, e.r)
    return { ...e, x, y, hex: hexPoints(x, y, 0.97) }
  }),
)

const viewport = ref(null)
const pz = usePanZoom(viewport, size, { maxZoom: 6 })
const hovered = ref(null)
const tip = computed(() => placed.value.find((e) => e.key === hovered.value) ?? null)

function activate(entry) {
  if (!pz.moved.value && entry.index != null) emit('select-asteroid', entry.index)
}
function onKey(event, entry) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (entry.index != null) emit('select-asteroid', entry.index)
  }
}

const sortedList = computed(() =>
  [...entries.value].sort((a, b) => (b.index != null) - (a.index != null) || a.distance - b.distance || a.info.label.localeCompare(b.info.label)),
)
</script>

<template>
  <div class="starmap">
    <div class="starmap-frame" :style="{ aspectRatio: `${extentX} / ${extentY}`, backgroundImage: `url(${SPACE_BACKGROUND})` }">
      <div
        ref="viewport"
        class="starmap-viewport"
        tabindex="0"
        role="application"
        :aria-label="$t('world.starmap.aria')"
        :style="{ touchAction: pz.touchAction.value }"
        v-on="pz.handlers"
      >
        <svg :viewBox="`0 0 ${extentX * 2} ${extentY * 2}`" preserveAspectRatio="none" class="starmap-svg">
          <g :transform="pz.transform.value">
            <polygon v-for="(points, i) in grid" :key="i" :points="points" class="starmap-cell" />
            <g
              v-for="e in placed"
              :key="e.key"
              class="starmap-entry"
              :class="{ asteroid: e.index != null, selected: e.index === selected }"
              :tabindex="e.index != null ? 0 : -1"
              :role="e.index != null ? 'button' : 'img'"
              :aria-label="$t('world.starmap.entry', { name: e.info.label, d: e.distance })"
              @pointerenter="hovered = e.key"
              @pointerleave="hovered = null"
              @focus="hovered = e.key"
              @blur="hovered = null"
              @click="activate(e)"
              @keydown="onKey($event, e)"
            >
              <polygon :points="e.hex" class="starmap-entry-hex" />
              <image
                v-if="e.info.icon"
                :href="e.info.icon"
                :x="e.x - (e.index != null ? 0.95 : 0.75)"
                :y="e.y - (e.index != null ? 0.95 : 0.75)"
                :width="e.index != null ? 1.9 : 1.5"
                :height="e.index != null ? 1.9 : 1.5"
              />
              <circle v-else :cx="e.x" :cy="e.y" r="0.35" class="starmap-dot" />
            </g>
          </g>
        </svg>
        <div v-if="tip" class="starmap-chip">
          {{ tip.info.label }} <span class="text-body-secondary">· {{ $t('world.starmap.distance', { d: tip.distance }) }}</span>
        </div>
      </div>
      <div class="starmap-controls">
        <button type="button" class="btn btn-sm btn-dark" :aria-label="$t('world.map.zoom_in')" :title="$t('world.map.zoom_in')" @click="pz.zoomAt(1.5)"><i class="bi bi-plus-lg"></i></button>
        <button type="button" class="btn btn-sm btn-dark" :aria-label="$t('world.map.zoom_out')" :title="$t('world.map.zoom_out')" @click="pz.zoomAt(1 / 1.5)"><i class="bi bi-dash-lg"></i></button>
      </div>
    </div>

    <details class="mt-2">
      <summary class="text-body-secondary">{{ $t('world.starmap.list', { n: entries.length }) }}</summary>
      <ul class="starmap-list list-unstyled mt-2 mb-0">
        <li v-for="e in sortedList" :key="e.key">
          <img v-if="e.info.icon" :src="e.info.icon" alt="" loading="lazy" />
          <span>{{ e.info.label }}</span>
          <span class="text-body-secondary small ms-auto">{{ $t('world.starmap.distance', { d: e.distance }) }}</span>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.starmap-frame {
  position: relative;
  width: min(100%, 640px);
  margin: 0 auto;
  border: 1px solid var(--sb-border);
  border-radius: 6px;
  background-size: cover;
  overflow: hidden;
}
.starmap-viewport {
  position: absolute;
  inset: 0;
  cursor: grab;
  outline: none;
}
.starmap-viewport:focus-visible {
  box-shadow: inset 0 0 0 2px var(--sb-hover);
}
.starmap-svg {
  display: block;
  width: 100%;
  height: 100%;
}
.starmap-cell {
  fill: rgba(242, 242, 242, 0.03);
  stroke: rgba(242, 242, 242, 0.2);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.starmap-entry {
  outline: none;
}
.starmap-entry-hex {
  fill: rgba(114, 188, 212, 0.12);
  stroke: none;
}
.starmap-entry.asteroid {
  cursor: pointer;
}
.starmap-entry.asteroid .starmap-entry-hex {
  fill: rgba(242, 242, 242, 0.12);
}
.starmap-entry:hover .starmap-entry-hex,
.starmap-entry:focus-visible .starmap-entry-hex {
  stroke: var(--bs-body-color);
  stroke-width: 1.5px;
  vector-effect: non-scaling-stroke;
}
.starmap-entry.selected .starmap-entry-hex {
  stroke: var(--sb-hover);
  stroke-width: 2px;
  vector-effect: non-scaling-stroke;
}
.starmap-dot {
  fill: #72bcd4;
}
.starmap-chip {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 0 0.5rem;
  border-radius: 4px;
  background: rgba(34, 37, 41, 0.9);
  font-size: 1.05rem;
  pointer-events: none;
}
.starmap-controls {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.starmap-controls .btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(34, 37, 41, 0.85);
  border-color: var(--sb-border);
}
.starmap-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.25rem 1rem;
  font-size: 1.05rem;
}
.starmap-list li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.starmap-list img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
</style>
