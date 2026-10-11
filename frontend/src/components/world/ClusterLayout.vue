<script setup>
import { computed } from 'vue'
import { asteroidInfo, zoneInfo } from '@/oniCatalog'

// Every asteroid's biome map side by side, placed by its cluster offset when
// all asteroids have one.
const props = defineProps({
  asteroids: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])

const GAP = 16

const layout = computed(() => {
  const list = props.asteroids.map((a, index) => ({ a, index, w: a.sizeX || 128, h: a.sizeY || 128 }))
  const useOffsets = list.every(({ a }) => Array.isArray(a.offset))
  let cursor = 0
  for (const item of list) {
    if (useOffsets) [item.x, item.gy] = item.a.offset
    else {
      item.x = cursor
      item.gy = 0
      cursor += item.w + GAP
    }
  }
  const top = Math.max(...list.map((i) => i.gy + i.h))
  const minX = Math.min(...list.map((i) => i.x))
  const minY = Math.min(...list.map((i) => i.gy))
  const width = Math.max(...list.map((i) => i.x + i.w)) - minX
  const label = Math.max(10, width / 55)
  for (const item of list) {
    item.x -= minX
    item.y = top - (item.gy + item.h) + label * 1.6
    item.label = asteroidInfo(item.a.id, item.a.name).label
    // Only print names that fit above the asteroid; the rest keep a <title>.
    item.short = item.label.replace(/ Asteroid$/, '')
    item.showLabel = item.short.length * label * 0.42 <= item.w + GAP
    item.paths = (item.a.biomes ?? []).map((b) => ({
      key: b.zone,
      color: zoneInfo(b.zone).color,
      d: (b.polygons ?? [])
        .filter((p) => p.length > 2)
        .map((p) => 'M' + p.map(([x, y]) => `${x} ${item.h - y}`).join('L') + 'Z')
        .join(''),
    }))
  }
  return { list, width, height: top - minY + label * 1.6, label }
})

function onKey(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('update:modelValue', index)
  }
}
</script>

<template>
  <svg
    class="cluster-layout"
    :viewBox="`0 0 ${layout.width} ${layout.height}`"
    :style="{ aspectRatio: `${layout.width} / ${layout.height}` }"
    role="group"
    :aria-label="$t('world.cluster_layout')"
  >
    <g
      v-for="item in layout.list"
      :key="item.index"
      :transform="`translate(${item.x} ${item.y})`"
      class="layout-asteroid"
      :class="{ selected: modelValue === item.index }"
      tabindex="0"
      role="button"
      :aria-pressed="modelValue === item.index"
      :aria-label="item.label"
      @click="emit('update:modelValue', item.index)"
      @keydown="onKey($event, item.index)"
    >
      <title>{{ item.label }}</title>
      <rect :width="item.w" :height="item.h" class="layout-bg" />
      <path v-for="p in item.paths" :key="p.key" :d="p.d" :fill="p.color" />
      <rect :width="item.w" :height="item.h" class="layout-outline" />
      <text v-if="item.showLabel" :x="item.w / 2" :y="-layout.label * 0.5" :font-size="layout.label" text-anchor="middle" class="layout-label">
        {{ item.short }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.cluster-layout {
  display: block;
  width: 100%;
  max-height: 340px;
}
.layout-asteroid {
  cursor: pointer;
  outline: none;
}
.layout-bg {
  fill: #111;
}
.layout-outline {
  fill: none;
  stroke: var(--sb-border);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.layout-asteroid:hover .layout-outline {
  stroke: var(--bs-body-color);
}
.layout-asteroid.selected .layout-outline,
.layout-asteroid:focus-visible .layout-outline {
  stroke: var(--sb-hover);
  stroke-width: 2.5px;
}
.layout-label {
  fill: var(--sb-muted);
  font-family: inherit;
}
.layout-asteroid.selected .layout-label {
  fill: var(--sb-hover);
}
</style>
