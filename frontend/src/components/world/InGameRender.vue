<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SEARCH_API_URL, headers } from '@/searchApi'

// "In-game look": the asteroid drawn with the game's own textures, rendered on
// the server on request (it costs a few seconds of CPU, so only on a click).
// Hidden unless the API says renders are on (/renders/info).
const props = defineProps({
  coordinate: { type: String, required: true },
  worldIndex: { type: Number, required: true },
})
const { t } = useI18n()

let infoPromise = null
function loadInfo() {
  infoPromise ??= fetch(`${SEARCH_API_URL}/renders/info`)
    .then((r) => (r.ok ? r.json() : { available: false }))
    .catch(() => ({ available: false }))
  return infoPromise
}

const info = ref(null)
const settled = ref(true)
// idle | waiting | ready | error
const state = ref('idle')
const ahead = ref(0)
const imageUrl = ref(null)
const message = ref('')
let timer = null
let run = 0

loadInfo().then((i) => (info.value = i))

function reset() {
  clearTimeout(timer)
  run++
  state.value = 'idle'
  imageUrl.value = null
  message.value = ''
}

async function poll(id) {
  const query = `world=${props.worldIndex}&settled=${settled.value ? 1 : 0}&format=json`
  let body
  let status
  try {
    const response = await fetch(`${SEARCH_API_URL}/worlds/${encodeURIComponent(props.coordinate)}/render?${query}`, {
      headers: await headers(),
    })
    status = response.status
    body = await response.json().catch(() => ({}))
  } catch {
    status = 0
    body = {}
  }
  if (id !== run) return
  if (body.status === 'ready' && body.url) {
    imageUrl.value = `${SEARCH_API_URL}${body.url}`
    state.value = 'ready'
  } else if (status === 202 || body.status === 'queued' || body.status === 'rendering' || body.status === 'busy') {
    state.value = 'waiting'
    ahead.value = body.ahead ?? 0
    timer = setTimeout(() => poll(id), Math.min(body.retryAfterMs ?? 3000, 15000))
  } else {
    state.value = 'error'
    message.value = body.message ?? body.error ?? t('world.render.failed')
  }
}

function start() {
  reset()
  state.value = 'waiting'
  poll(run)
}

watch(
  () => [props.coordinate, props.worldIndex],
  () => reset(),
)
watch(settled, () => {
  if (state.value !== 'idle') start()
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  run++
})
</script>

<template>
  <div v-if="info?.available" class="sb-panel in-game-render">
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
      <h3 class="sb-subheading mb-0 me-auto">{{ $t('world.render.heading') }}</h3>
      <div class="btn-group btn-group-sm" role="group" :aria-label="$t('world.render.variant')">
        <button type="button" class="btn" :class="settled ? 'btn-primary' : 'btn-outline-secondary'" @click="settled = true">
          {{ $t('world.render.settled') }}
        </button>
        <button type="button" class="btn" :class="!settled ? 'btn-primary' : 'btn-outline-secondary'" @click="settled = false">
          {{ $t('world.render.presettle') }}
        </button>
      </div>
    </div>

    <div v-if="state === 'idle'" class="render-placeholder">
      <p class="text-body-secondary small mb-2">{{ $t('world.render.intro') }}</p>
      <button type="button" class="btn btn-primary btn-sm" @click="start">
        <i class="bi bi-image me-1" aria-hidden="true"></i>{{ $t('world.render.show') }}
      </button>
    </div>
    <div v-else-if="state === 'waiting'" class="render-placeholder">
      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
      {{ ahead > 0 ? $t('world.render.queued', { n: ahead }) : $t('world.render.rendering') }}
    </div>
    <div v-else-if="state === 'error'" class="alert sb-alert mb-0">
      {{ message }}
      <button type="button" class="btn btn-link btn-sm p-0 ms-2 align-baseline" @click="start">{{ $t('world.render.retry') }}</button>
    </div>
    <figure v-else class="mb-0">
      <a :href="imageUrl" target="_blank" rel="noopener">
        <img :src="imageUrl" :alt="$t('world.render.alt')" class="render-image" loading="lazy" />
      </a>
      <figcaption class="small text-body-secondary mt-2">
        {{ $t('world.render.open_full') }}
      </figcaption>
    </figure>

    <p class="render-credit small text-body-secondary mb-0 mt-2">{{ info.credit }}</p>
  </div>
</template>

<style scoped>
.render-placeholder {
  min-height: 6rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.render-placeholder:has(.spinner-border) {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
.render-image {
  display: block;
  max-width: 100%;
  max-height: 80vh;
  height: auto;
  margin: 0 auto;
  border-radius: 4px;
  image-rendering: pixelated;
}
.render-credit {
  font-size: 0.75rem;
}
</style>
