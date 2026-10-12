<script setup>
import { computed } from 'vue'
import { SPAWN_KINDS, spawnableInfo } from '@/data/spawnables'

// What the game spawns on the asteroid at the start: critters, plants and
// seeds lying around, with counts. Clicking one highlights it on the map.
// Comes from the settled map (asteroid.ambient), so it shows once that is in.
const props = defineProps({
  asteroid: { type: Object, required: true },
  settled: { type: Boolean, default: false },
  modelValue: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])

const groups = computed(() => {
  const byId = new Map()
  for (const a of props.asteroid.ambient ?? []) {
    const row = byId.get(a.id) ?? { ...spawnableInfo(a.id), count: 0 }
    row.count++
    byId.set(a.id, row)
  }
  const kinds = new Map()
  for (const row of byId.values()) kinds.set(row.kind, [...(kinds.get(row.kind) ?? []), row])
  return [...kinds.entries()]
    .sort(([a], [b]) => SPAWN_KINDS[a].order - SPAWN_KINDS[b].order)
    .map(([kind, rows]) => ({
      kind,
      color: SPAWN_KINDS[kind].color,
      total: rows.reduce((n, r) => n + r.count, 0),
      rows: rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    }))
})

function toggle(id) {
  emit('update:modelValue', props.modelValue === id ? null : id)
}
</script>

<template>
  <div v-if="groups.length" class="critter-summary">
    <div v-for="group in groups" :key="group.kind" class="spawn-group">
      <div class="spawn-group-head">
        <span class="spawn-dot" :style="{ background: group.color }"></span>
        {{ $t(`world.critters.kinds.${group.kind}`) }}
        <span class="spawn-total">{{ group.total.toLocaleString() }}</span>
      </div>
      <ul class="spawn-list list-unstyled mb-0">
        <li v-for="row in group.rows" :key="row.id">
          <button
            type="button"
            class="spawn-row"
            :class="{ active: modelValue === row.id }"
            :aria-pressed="modelValue === row.id"
            :title="$t('world.critters.show_on_map', { name: row.name })"
            @click="toggle(row.id)"
          >
            <span class="spawn-name">{{ row.name }}</span>
            <span class="spawn-count">{{ row.count.toLocaleString() }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
  <p v-else class="text-body-secondary mb-0">{{ $t(settled ? 'world.critters.none' : 'world.critters.after_settle') }}</p>
</template>

<style scoped>
.critter-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.spawn-group-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
  font-weight: 600;
}
.spawn-total {
  margin-left: auto;
  color: var(--sb-muted);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
.spawn-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
  flex: none;
}
.spawn-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.3rem;
}
.spawn-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--sb-border);
  border-radius: 6px;
  background: var(--sb-card);
  color: inherit;
  text-align: left;
}
.spawn-row:hover {
  border-color: var(--bs-body-color);
}
.spawn-row.active {
  border-color: var(--sb-hover);
  box-shadow: 0 0 0 1px var(--sb-hover);
}
.spawn-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spawn-count {
  color: var(--sb-muted);
  font-variant-numeric: tabular-nums;
}
</style>
