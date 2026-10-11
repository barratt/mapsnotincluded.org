<script setup>
import { computed, ref } from 'vue'
import { elementTable, formatMass } from '@/worldTiles'

// Elements on the asteroid's tile map by share of its cells (vacuum left
// out), with their total mass. Clicking one highlights its cells on the map.
const props = defineProps({
  asteroid: { type: Object, required: true },
  tiles: { type: Object, default: null },
  modelValue: { type: Number, default: null },
})
const emit = defineEmits(['update:modelValue'])
const showAll = ref(false)
const SHOWN = 12

const rows = computed(() => {
  const data = props.asteroid.tileData
  if (!data) return []
  const table = elementTable(props.tiles)
  const cells = new Uint32Array(table.length)
  const mass = new Float64Array(table.length)
  for (let i = 0; i < data.element.length; i++) {
    cells[data.element[i]]++
    mass[data.element[i]] += data.mass[i]
  }
  const total = data.element.length
  return table
    .map((e, index) => ({ ...e, index, cells: cells[index], mass: mass[index], share: cells[index] / total }))
    .filter((r) => r.cells > 0 && r.state !== 'v')
    .sort((a, b) => b.cells - a.cells)
})
const visible = computed(() => (showAll.value ? rows.value : rows.value.slice(0, SHOWN)))
const swatch = (rgb) => `rgb(${rgb.join(',')})`

function toggle(index) {
  emit('update:modelValue', props.modelValue === index ? null : index)
}
</script>

<template>
  <div v-if="rows.length">
    <ul class="element-legend list-unstyled mb-0">
      <li v-for="row in visible" :key="row.id">
        <button
          type="button"
          class="element-row"
          :class="{ active: modelValue === row.index }"
          :aria-pressed="modelValue === row.index"
          :title="`${row.name} (${row.stateName}), ${formatMass(row.mass)}`"
          @click="toggle(row.index)"
        >
          <span class="element-swatch" :class="`state-${row.state}`" :style="{ background: swatch(row.rgb) }"></span>
          <span class="element-name">{{ row.name }}</span>
          <span class="element-share">{{ row.share >= 0.01 ? Math.round(row.share * 100) + '%' : '<1%' }}</span>
        </button>
      </li>
    </ul>
    <button v-if="rows.length > SHOWN" type="button" class="btn btn-link btn-sm px-0 mt-1" @click="showAll = !showAll">
      {{ showAll ? $t('world.tiles.fewer_elements') : $t('world.tiles.more_elements', { n: rows.length - SHOWN }) }}
    </button>
  </div>
</template>

<style scoped>
.element-legend {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: 0.3rem;
}
.element-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.2rem 0.45rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--sb-card);
  color: inherit;
  font-size: 1rem;
  text-align: left;
}
.element-row:hover,
.element-row.active {
  border-color: var(--sb-hover);
}
.element-swatch {
  width: 14px;
  height: 14px;
  flex: none;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.4);
}
.element-swatch.state-l {
  border-radius: 50% 50% 3px 3px;
}
.element-swatch.state-g {
  border-radius: 50%;
  opacity: 0.75;
}
.element-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.element-share {
  color: var(--sb-muted);
  font-variant-numeric: tabular-nums;
}
</style>
