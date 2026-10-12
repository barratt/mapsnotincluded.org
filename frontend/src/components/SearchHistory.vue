<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '@/searchApi'

// "Recent searches": the visitor's past searches (their Steam account's when
// signed in, otherwise this browser's). Choosing one opens its link.
const props = defineProps({
  // [{ id, label }] so presets show their button label
  presets: { type: Array, default: () => [] },
})
const emit = defineEmits(['open'])

const presetLabel = (id) => props.presets.find((p) => p.id === id)?.label ?? id

const items = ref([])
const open = ref(false)
const root = ref(null)

async function refresh() {
  const { ok, data } = await api('/my/searches?limit=20').catch(() => ({ ok: false }))
  if (ok && Array.isArray(data)) items.value = data
}

function choose(item) {
  open.value = false
  emit('open', item.id)
}

function ago(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function onDocClick(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}

onMounted(() => {
  refresh()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

defineExpose({ refresh })
</script>

<template>
  <div v-if="items.length" ref="root" class="search-history">
    <button type="button" class="btn btn-sm btn-outline-secondary" :aria-expanded="open" @click="open = !open">
      <i class="bi bi-clock-history" aria-hidden="true"></i>
      {{ $t('home.search.history') }}
    </button>
    <ul v-if="open" class="history-menu list-unstyled mb-0">
      <li v-for="item in items" :key="item.id">
        <button type="button" class="history-item" @click="choose(item)">
          <span class="history-text">
            <i v-if="item.status === 'coordinate'" class="bi bi-geo-alt" aria-hidden="true"></i>
            <i v-else-if="item.preset" class="bi bi-lightning" aria-hidden="true"></i>
            {{ item.text || presetLabel(item.preset) }}
          </span>
          <span class="history-meta">
            <template v-if="item.results != null">{{ $t('home.search.history_results', { n: item.results }) }} · </template>{{ ago(item.createdAt) }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.search-history {
  position: relative;
}
.history-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  width: min(28rem, 90vw);
  max-height: 20rem;
  overflow-y: auto;
  padding: 0.25rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  background: var(--bs-body-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.history-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--bs-body-color);
  text-align: left;
}
.history-item:hover {
  background: var(--bs-tertiary-bg);
}
.history-text {
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.history-meta {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}
</style>
