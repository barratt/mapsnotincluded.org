<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import WorldCard from '@/components/WorldCard.vue'
import SearchAccount from '@/components/SearchAccount.vue'
import SearchScope from '@/components/SearchScope.vue'
import { SEARCH_API_URL, api, jobEvents, steamSignInUrl } from '@/searchApi'

const MAX_LENGTH = 300

const { t } = useI18n()

const text = ref('')
const presets = ref([])
const loading = ref(false)
const result = ref(null)
const job = ref(null)
const usage = ref(null)
const scope = ref(null)
let stopEvents = null

const RUNNING = ['queued', 'running']

onMounted(async () => {
  if (!SEARCH_API_URL) return
  const { ok, data } = await api('/presets').catch(() => ({ ok: false }))
  if (ok) presets.value = data
})

onBeforeUnmount(() => stopEvents?.())

function follow(jobId) {
  stopEvents?.()
  job.value = { status: 'queued', worldsChecked: 0, matchesFound: 0 }
  stopEvents = jobEvents(jobId, (progress) => {
    job.value = progress
  })
}

async function search(body) {
  stopEvents?.()
  loading.value = true
  result.value = null
  job.value = null
  try {
    const { data } = await api('/search', { method: 'POST', body: { ...body, options: scope.value ?? undefined } })
    result.value = data.status ? data : { status: 'unavailable', message: t('home.search.unavailable') }
    if (data.usage) usage.value = data.usage
    if (data.status === 'searching') follow(data.jobId)
  } catch {
    result.value = { status: 'unavailable', message: t('home.search.unavailable') }
  } finally {
    loading.value = false
  }
}

function submitText() {
  const value = text.value.trim()
  if (value && !loading.value) search({ text: value })
}

function submitPreset(preset) {
  if (loading.value) return
  text.value = ''
  search({ preset: preset.id })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <main class="container mt-5 home-search">
    <h1>{{ $t('home.title') }}</h1>

    <section v-if="SEARCH_API_URL" class="mt-4">
      <h2 class="text-center mt-2 search-title">{{ $t('home.search.title') }}</h2>

      <SearchScope class="mt-3" @change="scope = $event" />

      <form class="mt-2" @submit.prevent="submitText">
        <div class="input-group input-group-lg">
          <input
            v-model="text"
            type="text"
            class="form-control"
            :maxlength="MAX_LENGTH"
            :placeholder="$t('home.search.placeholder')"
            :disabled="!SEARCH_API_URL"
            :aria-label="$t('home.search.title')"
          />
          <button class="btn btn-warning" type="submit" :disabled="loading || !text.trim() || !SEARCH_API_URL">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ $t('home.search.button') }}
          </button>
        </div>
      </form>

      <SearchAccount :usage="usage" @usage="usage = $event" />

      <div v-if="presets.length" class="presets d-flex gap-2 mt-3 justify-content-md-center">
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="btn btn-outline-secondary btn-sm text-nowrap"
          :disabled="loading"
          @click="submitPreset(preset)"
        >
          {{ preset.label }}
        </button>
      </div>
      <p v-if="presets.length" class="text-center small text-body-secondary mt-1 mb-0">{{ $t('home.search.presets_free') }}</p>

      <section v-if="loading" class="text-center mt-4 text-muted">
        {{ $t('home.search.searching') }}
      </section>

      <section v-else-if="result" class="mt-4">
        <template v-if="result.status === 'ok' || result.status === 'searching'">
          <div class="mb-3">
            <div class="small text-body-secondary mb-1">{{ $t('home.search.read_as') }}</div>
            <div class="d-flex flex-wrap gap-1">
              <span v-for="line in result.description" :key="line" class="read-as-chip">{{ line }}</span>
              <span v-if="!result.description.length" class="read-as-chip">{{ $t('home.search.any_world') }}</span>
            </div>
            <small class="text-body-secondary d-block mt-1">{{ $t('home.search.searched', { count: result.indexedWorlds.toLocaleString() }) }}</small>
          </div>

          <!-- Background search -->
          <div v-if="job" class="mb-3">
            <div class="alert" :class="job.status === 'done' ? 'alert-success' : 'alert-secondary'">
              <div v-if="job.status !== 'done' && job.status !== 'exhausted' && job.status !== 'failed'" class="d-flex align-items-center gap-2">
                <span class="spinner-border spinner-border-sm" role="status"></span>
                <span>{{ job.message ?? result.message }}</span>
              </div>
              <div v-else-if="job.message">{{ job.message }}</div>
              <div class="small mt-1">
                {{ $t('home.search.progress', { checked: job.worldsChecked.toLocaleString(), found: job.matchesFound }) }}
              </div>
            </div>
            <!-- Best so far: matches as they are found, then the closest worlds
                 with what they meet (green) and miss (red). -->
            <div v-if="(job.worlds ?? []).length || (job.nearMatches ?? []).length" class="d-flex align-items-center gap-2 mb-2">
              <h2 class="h6 mb-0">{{ RUNNING.includes(job.status) ? $t('home.search.best_so_far') : (job.worlds ?? []).length ? $t('home.search.found') : $t('home.search.closest') }}</h2>
              <span v-if="RUNNING.includes(job.status)" class="badge text-bg-info d-inline-flex align-items-center gap-1">
                <span class="spinner-grow spinner-grow-sm" role="status"></span>
                {{ $t('home.search.still_searching') }}
              </span>
            </div>
            <div class="row g-3">
              <div v-for="world in job.worlds ?? []" :key="world.coordinate" class="col-12 col-sm-6 col-xl-4">
                <WorldCard :world="world" :highlight="result.highlight" />
              </div>
              <div v-for="world in job.status === 'done' ? [] : job.nearMatches ?? []" :key="world.coordinate" class="col-12 col-sm-6 col-xl-4">
                <WorldCard :world="world" :highlight="result.highlight" />
              </div>
            </div>
          </div>

          <div v-else-if="result.message" class="alert alert-secondary">{{ result.message }}</div>

          <div class="row g-3">
            <div v-for="world in result.worlds" :key="world.coordinate" class="col-12 col-sm-6 col-xl-4">
              <WorldCard :world="world" :highlight="result.highlight" />
            </div>
          </div>
        </template>

        <div v-else-if="result.status === 'rate_limited' || result.status === 'ip_blocked'" class="alert alert-warning">
          <div v-if="result.status === 'rate_limited'">{{ $t('home.search.rate_limited', { time: formatTime(result.resetAt) }) }}</div>
          <div v-else>{{ result.message }}</div>
          <a v-if="result.canSignIn" :href="steamSignInUrl()" class="btn btn-sm btn-outline-dark mt-2 d-inline-flex align-items-center gap-2">
            <i class="bi bi-steam" aria-hidden="true"></i>
            {{ $t('home.search.sign_in_more', { n: result.usage?.signedInLimit ?? usage?.signedInLimit ?? 10 }) }}
          </a>
        </div>

        <div v-else class="alert alert-warning">
          <div>{{ result.message }}</div>
          <ul v-if="result.problems" class="mb-0 mt-2">
            <li v-for="problem in result.problems" :key="problem">{{ problem }}</li>
          </ul>
        </div>
      </section>
      <p class="text-center small mt-3 mb-0"><router-link to="/privacy">{{ $t('privacy.link') }}</router-link></p>
    </section>

    <i18n-t keypath="home.description_2" tag="p" class="mt-5">
      <template v-slot:contributeLink>
        <router-link to="/contribute">{{ $t('home.link.contribute') }}</router-link>
      </template>
      <template v-slot:discordLink>
        <a href="https://discord.gg/3vhCpp6PNq" target="mni_disc">{{ $t('home.link.discord') }}</a>
      </template>
      <template v-slot:githubLink>
        <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_gh">{{ $t('home.link.github') }}</a>
      </template>
    </i18n-t>

    <div class="d-flex gap-3 mt-5 flex-column flex-md-row">
      <router-link to="/map-explorer" class="btn btn-lg btn-outline-warning flex-grow-1">{{ $t('home.link_map_explorer')
        }}</router-link>
      <router-link to="/trait-finder" class="btn btn-lg btn-outline-success flex-grow-1">{{
        $t('home.link_trait_finder') }}</router-link>
    </div>
  </main>
</template>

<style scoped>
.search-title {
  font-size: clamp(1.35rem, 4.5vw, 2rem);
}
/* One scrollable row of presets on phones, wrapped on wider screens. */
.presets {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.25rem;
}
@media (min-width: 768px) {
  .presets {
    flex-wrap: wrap;
  }
}
.read-as-chip {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  background: var(--bs-tertiary-bg);
  font-size: 0.85rem;
}
@media (max-width: 575.98px) {
  .home-search .input-group-lg > .form-control,
  .home-search .input-group-lg > .btn {
    font-size: 1rem;
    padding: 0.6rem 0.75rem;
  }
}
</style>
