<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { api, getSession, steamSignInUrl } from '@/searchApi'
import { createBrowserWorker } from '@/browserWorker'

// Unlisted: generate worlds for the MNI index from this browser tab, with the
// signed-in contributor's own API key. Not linked from the site yet.
const me = ref(null)
const checked = ref(false)
const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
const threads = ref(Math.max(1, Math.min(8, Math.floor(cores / 2))))
const work = ref('auto')
const stats = ref({ status: 'idle', generated: 0, accepted: 0, duplicates: 0, failures: 0, errors: 0, jobMatches: 0, rate: 0 })

const worker = createBrowserWorker({ onUpdate: (s) => (stats.value = s) })
const running = computed(() => ['loading', 'running', 'stopping'].includes(stats.value.status))

onMounted(async () => {
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex'
  document.head.append(robots)
  if (getSession()) {
    const { data } = await api('/me').catch(() => ({ data: null }))
    me.value = data?.signedIn ? data : null
  }
  checked.value = true
})
// Leaving the page stops the work (uploading what is done).
onBeforeUnmount(() => worker.stop())
window.addEventListener('beforeunload', () => worker.stop())

const start = () => worker.start({ threads: threads.value, work: work.value })
const stop = () => worker.stop()
const fmt = (n) => Number(n ?? 0).toLocaleString()
</script>

<template>
  <main class="container py-4 contribute-browser">
    <h1 class="mb-2">{{ $t('browser_worker.title') }}</h1>
    <p class="text-body-secondary">{{ $t('browser_worker.intro') }}</p>

    <div v-if="!checked" class="text-body-secondary">{{ $t('browser_worker.loading') }}</div>
    <div v-else-if="!me" class="sb-panel">
      <p>{{ $t('browser_worker.sign_in') }}</p>
      <a :href="steamSignInUrl()" class="btn btn-sm btn-outline-light"><i class="bi bi-steam me-1" aria-hidden="true"></i>{{ $t('browser_worker.sign_in_button') }}</a>
    </div>

    <template v-else>
      <div class="sb-panel mb-3">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small mb-1" for="bw-threads">{{ $t('browser_worker.threads', { n: threads, cores }) }}</label>
            <input id="bw-threads" v-model.number="threads" type="range" class="form-range" min="1" :max="cores" :disabled="running" />
          </div>
          <div class="col-12 col-md-5">
            <label class="form-label small mb-1" for="bw-work">{{ $t('browser_worker.work') }}</label>
            <select id="bw-work" v-model="work" class="form-select form-select-sm" :disabled="running">
              <option value="auto">{{ $t('browser_worker.work_auto') }}</option>
              <option value="jobs">{{ $t('browser_worker.work_jobs') }}</option>
              <option value="index">{{ $t('browser_worker.work_index') }}</option>
            </select>
          </div>
          <div class="col-12 col-md-3 d-grid">
            <button v-if="!running" type="button" class="btn btn-warning" @click="start">
              <i class="bi bi-play-fill me-1" aria-hidden="true"></i>{{ $t('browser_worker.start') }}
            </button>
            <button v-else type="button" class="btn btn-outline-light" :disabled="stats.status !== 'running'" @click="stop">
              <i class="bi bi-stop-fill me-1" aria-hidden="true"></i>{{ stats.status === 'loading' ? $t('browser_worker.loading_generator') : $t('browser_worker.stop') }}
            </button>
          </div>
        </div>
        <p class="small text-body-secondary mt-2 mb-0">{{ $t('browser_worker.note') }}</p>
      </div>

      <div class="stat-grid mb-3">
        <div class="sb-panel stat"><div class="label">{{ $t('browser_worker.status') }}</div>
          <div class="value">{{ $t(`browser_worker.states.${stats.status}`) }}</div>
          <div class="sub">{{ stats.doing ? $t(`browser_worker.doing.${stats.doing}`) : '' }}</div></div>
        <div class="sb-panel stat"><div class="label">{{ $t('browser_worker.rate') }}</div><div class="value">{{ fmt(stats.rate) }}</div><div class="sub">{{ $t('browser_worker.per_hour') }}</div></div>
        <div class="sb-panel stat"><div class="label">{{ $t('browser_worker.generated') }}</div><div class="value">{{ fmt(stats.generated) }}</div>
          <div class="sub">{{ $t('browser_worker.added', { n: fmt(stats.accepted), dup: fmt(stats.duplicates) }) }}</div></div>
        <div class="sb-panel stat"><div class="label">{{ $t('browser_worker.matches') }}</div><div class="value">{{ fmt(stats.jobMatches) }}</div><div class="sub">{{ $t('browser_worker.matches_sub') }}</div></div>
      </div>
      <div v-if="stats.message" class="alert sb-alert">{{ stats.message }}</div>
      <p v-if="stats.version" class="small text-body-secondary">{{ $t('browser_worker.version', { version: stats.version }) }}</p>
    </template>
  </main>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}
.stat .label {
  color: var(--sb-muted);
  font-size: 0.9rem;
}
.stat .value {
  font-size: 1.6rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.stat .sub {
  color: var(--sb-muted);
  font-size: 0.85rem;
  min-height: 1.2em;
}
</style>
