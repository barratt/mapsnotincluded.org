<script setup>
import { computed, ref } from 'vue'
import { geyserInfo, geyserRating } from '@/oniCatalog'
import GeyserBadge from './GeyserBadge.vue'
import QualityBar from './QualityBar.vue'
import { activeShare, dec1, dec2, eruptionShare, hasTiming, int, tonsPerCycle } from './format'

const props = defineProps({
  geysers: { type: Array, default: () => [] },
  selected: { type: String, default: null },
})
const emit = defineEmits(['update:selected'])

const COLUMNS = [
  { key: 'name', label: 'world.geyser.col_name', get: (r) => r.label, numeric: false },
  { key: 'avg', label: 'world.geyser.col_avg', get: (r) => r.g.avgOutput ?? -1, numeric: true },
  { key: 'quality', label: 'world.geyser.col_quality', get: (r) => r.rating ?? -1, numeric: true },
  { key: 'eruption', label: 'world.geyser.col_eruption', get: (r) => eruptionShare(r.g) ?? -1, numeric: true },
  { key: 'activity', label: 'world.geyser.col_activity', get: (r) => activeShare(r.g) ?? -1, numeric: true },
  { key: 'position', label: 'world.geyser.col_position', get: (r) => -(r.g.y ?? 0) * 10000 + (r.g.x ?? 0), numeric: true },
]

const sortKey = ref('avg')
const sortDir = ref(-1)

const rows = computed(() => {
  const list = props.geysers.map((g, i) => {
    const info = geyserInfo(g.type, g.name)
    return { key: `g${i}`, g, label: info.label, icon: info.icon, rating: geyserRating(g) }
  })
  const column = COLUMNS.find((c) => c.key === sortKey.value)
  return list.sort((a, b) => {
    const av = column.get(a)
    const bv = column.get(b)
    const cmp = column.numeric ? av - bv : String(av).localeCompare(String(bv))
    return cmp * sortDir.value || a.label.localeCompare(b.label)
  })
})

function sortBy(key) {
  if (sortKey.value === key) sortDir.value = -sortDir.value
  else {
    sortKey.value = key
    sortDir.value = key === 'name' || key === 'position' ? 1 : -1
  }
}

function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value > 0 ? 'ascending' : 'descending'
}

function select(row) {
  emit('update:selected', props.selected === row.key ? null : row.key)
}

const pct = (share) => (share == null ? '' : `${Math.round(share * 100)}%`)
</script>

<template>
  <div v-if="!geysers.length" class="text-body-secondary">{{ $t('world.geyser.none') }}</div>
  <template v-else>
    <!-- Desktop / tablet: sortable table -->
    <div class="table-responsive d-none d-md-block">
      <table class="table table-sm align-middle geyser-table mb-0">
        <thead>
          <tr>
            <th v-for="col in COLUMNS" :key="col.key" scope="col" :aria-sort="ariaSort(col.key)">
              <button type="button" class="sort-button" @click="sortBy(col.key)">
                {{ $t(col.label) }}
                <i v-if="sortKey === col.key" class="bi" :class="sortDir > 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'" aria-hidden="true"></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key" :class="{ selected: selected === row.key }" @click="select(row)">
            <td>
              <button type="button" class="geyser-name" :aria-pressed="selected === row.key" @click.stop="select(row)">
                <GeyserBadge :icon="row.icon" :rating="row.rating" :size="36" />
                <span>
                  {{ row.label }}
                  <span v-if="row.g.ambient" class="d-block small text-body-secondary" :title="$t('world.geyser.ambient_note')">{{ $t('world.geyser.ambient_short') }}</span>
                </span>
              </button>
            </td>
            <td class="text-nowrap">
              <div class="fw-bold">{{ int(row.g.avgOutput) }} g/s</div>
              <div class="small text-body-secondary">{{ $t('world.geyser.tons_per_cycle', { t: dec2(tonsPerCycle(row.g.avgOutput)) }) }}</div>
            </td>
            <td><QualityBar :geyser="row.g" compact /></td>
            <td>
              <template v-if="hasTiming(row.g)">
                <div>{{ $t('world.geyser.eruption_short', { rate: int(row.g.emitRate), on: int(row.g.eruptionSec), period: int(row.g.eruptionSec + row.g.idleSec) }) }}</div>
                <div class="small text-body-secondary">{{ $t('world.geyser.share', { pct: pct(eruptionShare(row.g)) }) }}</div>
              </template>
              <span v-else class="text-body-secondary">–</span>
            </td>
            <td>
              <template v-if="hasTiming(row.g)">
                <div>{{ $t('world.geyser.activity_short', { on: dec1(row.g.activeCycles), period: dec1(row.g.activeCycles + row.g.dormantCycles) }) }}</div>
                <div class="small text-body-secondary">{{ $t('world.geyser.share', { pct: pct(activeShare(row.g)) }) }}</div>
              </template>
              <span v-else class="text-body-secondary">–</span>
            </td>
            <td class="text-nowrap font-monospace small">{{ row.g.x ?? '–' }}, {{ row.g.y ?? '–' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phones: cards with a sort picker -->
    <div class="d-md-none">
      <label class="d-flex align-items-center gap-2 mb-2">
        <span class="text-body-secondary">{{ $t('world.geyser.sort_by') }}</span>
        <select v-model="sortKey" class="form-select form-select-sm w-auto" @change="sortDir = sortKey === 'name' || sortKey === 'position' ? 1 : -1">
          <option v-for="col in COLUMNS" :key="col.key" :value="col.key">{{ $t(col.label) }}</option>
        </select>
      </label>
      <ul class="list-unstyled mb-0 d-grid gap-2">
        <li v-for="row in rows" :key="row.key">
          <button type="button" class="geyser-card" :class="{ selected: selected === row.key }" :aria-pressed="selected === row.key" @click="select(row)">
            <div class="d-flex align-items-center gap-2">
              <GeyserBadge :icon="row.icon" :rating="row.rating" :size="40" />
              <div class="flex-grow-1 lh-sm">
                <div>{{ row.label }}</div>
                <div class="small text-body-secondary">
                  <span class="fw-bold text-body">{{ int(row.g.avgOutput) }} g/s</span>
                  · {{ $t('world.geyser.tons_per_cycle', { t: dec2(tonsPerCycle(row.g.avgOutput)) }) }}
                </div>
              </div>
              <span class="font-monospace small text-body-secondary">{{ row.g.x }}, {{ row.g.y }}</span>
            </div>
            <QualityBar :geyser="row.g" class="mt-1" />
            <div v-if="hasTiming(row.g)" class="small mt-1">
              <div>{{ $t('world.geyser.eruption_short', { rate: int(row.g.emitRate), on: int(row.g.eruptionSec), period: int(row.g.eruptionSec + row.g.idleSec) }) }}</div>
              <div>{{ $t('world.geyser.activity_short', { on: dec1(row.g.activeCycles), period: dec1(row.g.activeCycles + row.g.dormantCycles) }) }}</div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </template>
</template>

<style scoped>
.geyser-table {
  --bs-table-bg: transparent;
  font-size: 1.1rem;
}
.geyser-table th {
  font-weight: normal;
  color: var(--sb-muted);
  white-space: nowrap;
}
.sort-button {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
}
.sort-button:hover {
  color: var(--bs-body-color);
}
.geyser-table tbody tr {
  cursor: pointer;
}
.geyser-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.04);
}
.geyser-table tbody tr.selected td {
  background: rgba(255, 235, 59, 0.08);
}
.geyser-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
}
.geyser-card {
  display: block;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--sb-border);
  border-radius: 8px;
  background: var(--sb-card);
  color: inherit;
  text-align: left;
  font-size: 1.1rem;
}
.geyser-card.selected,
.geyser-table tbody tr.selected .geyser-name span {
  border-color: var(--sb-hover);
}
.geyser-table tbody tr.selected .geyser-name span {
  color: var(--sb-hover);
}
</style>
