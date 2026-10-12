<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import SearchHistory from '@/components/SearchHistory.vue'
import WorldCard from '@/components/WorldCard.vue'
import AdSlot from '@/components/AdSlot.vue'
import StoreLinks from '@/components/StoreLinks.vue'
import SupportLinks from '@/components/SupportLinks.vue'
import { site } from '@/siteConfig'
import SearchAccount from '@/components/SearchAccount.vue'
import SearchScope from '@/components/SearchScope.vue'
import FilterBuilder from '@/components/FilterBuilder.vue'
import { SEARCH_API_URL, api, jobEvents, steamSignInUrl } from '@/searchApi'

const MAX_LENGTH = 300

const { t } = useI18n()

const text = ref('')
const presets = ref([])
// A pasted world code opens that world (the search API recognises it).
const COORDINATE_EXAMPLE = 'V-LUSH-C-654048478-0-0-0'
const looksLikeCoordinate = computed(() => /^[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{1,10}-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i.test(text.value.trim()))
const loading = ref(false)
const result = ref(null)
const job = ref(null)
const usage = ref(null)
const scope = ref(null)
// The conditions shown as pills: the last search's (typed or built), or the
// player's edits since.
const builtFilter = ref(null)
const scopeRef = ref(null)
watch(
  () => result.value?.filter,
  (f) => {
    if (!f) return
    // Game mode, DLCs and clusters go to the toggles; the rest are pills.
    const { gameMode, dlcs, clusters, ...conditions } = JSON.parse(JSON.stringify(f))
    if (gameMode || dlcs || clusters) scopeRef.value?.apply({ gameMode, dlcs, clusters })
    builtFilter.value = Object.keys(conditions).length ? conditions : null
  },
)
let stopEvents = null

const RUNNING = ['queued', 'running']

const route = useRoute()
const router = useRouter()
const history = ref(null)

onMounted(async () => {
  if (!SEARCH_API_URL) return
  if (route.query.s) openSearch(String(route.query.s))
  const { ok, data } = await api('/presets').catch(() => ({ ok: false }))
  if (ok) presets.value = data
})

// Each search lives at /?s=<id>, so back, forward, bookmarks and shared links
// show it again. Opening a link re-runs its stored filter for free.
watch(
  () => route.query.s,
  (id) => {
    if (!id) {
      stopEvents?.()
      result.value = null
      job.value = null
    } else if (id !== result.value?.searchId) {
      openSearch(String(id))
    }
  },
)

async function openSearch(id) {
  stopEvents?.()
  loading.value = true
  job.value = null
  try {
    const { ok, data } = await api(`/searches/${encodeURIComponent(id)}`)
    if (!ok) {
      result.value = { status: 'unavailable', message: t('home.search.link_missing') }
      return
    }
    if (data.status === 'coordinate' && data.coordinate) {
      router.replace(`/world/${data.coordinate}`)
      return
    }
    result.value = data
    if (data.text) text.value = data.text
    if (data.jobId) follow(data.jobId)
  } catch {
    result.value = { status: 'unavailable', message: t('home.search.unavailable') }
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  stopEvents?.()
  observer?.disconnect()
})

// Infinite scroll: results come 20 at a time; the next page loads when the
// end of the list comes into view (or from the button below it).
const loadingMore = ref(false)
const moreSentinel = ref(null)
let observer = null

async function loadMore() {
  const current = result.value
  if (!current?.hasMore || !current.searchId || loadingMore.value) return
  loadingMore.value = true
  try {
    const { ok, data } = await api(`/searches/${encodeURIComponent(current.searchId)}/results?offset=${current.worlds.length}`)
    if (result.value !== current) return
    if (!ok) {
      current.hasMore = false
      return
    }
    const seen = new Set(current.worlds.map((w) => w.coordinate))
    current.worlds.push(...data.worlds.filter((w) => !seen.has(w.coordinate)))
    current.hasMore = data.hasMore
  } catch {
    current.hasMore = false
  } finally {
    loadingMore.value = false
  }
  // Still in view (a tall screen): keep going.
  await nextTick()
  if (inView(moreSentinel.value)) loadMore()
}

function inView(node) {
  if (!node) return false
  const rect = node.getBoundingClientRect()
  return rect.top < window.innerHeight + 400
}

watch(moreSentinel, (node) => {
  observer?.disconnect()
  if (!node || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) loadMore()
  }, { rootMargin: '400px' })
  observer.observe(node)
})

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
    if (data.usage) usage.value = data.usage
    // A pasted coordinate: straight to its world page.
    if (data.status === 'coordinate' && data.coordinate) {
      router.push(`/world/${data.coordinate}`)
      return
    }
    result.value = data.status ? data : { status: 'unavailable', message: t('home.search.unavailable') }
    if (data.status === 'searching') follow(data.jobId)
    if (data.searchId) router.push({ path: '/', query: { s: data.searchId } })
    history.value?.refresh()
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

// Notes the server adds to the description (e.g. a share lowered to the best
// seen); the conditions themselves are shown as pills.
const resultNotes = computed(() => (result.value?.description ?? []).filter((line) => /^No world we have generated/.test(line)))

// Search with the pills: no AI, free like presets.
function submitFilter(filter) {
  if (loading.value || !filter) return
  search({ filter })
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

      <SearchScope ref="scopeRef" class="mt-3" @change="scope = $event" />

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
            {{ looksLikeCoordinate ? $t('home.search.open_world') : $t('home.search.button') }}
          </button>
        </div>
        <div class="search-hint mt-1">
          {{ $t('home.search.coordinate_hint') }}
          <button type="button" class="btn btn-link btn-sm p-0 align-baseline example-code" @click="text = COORDINATE_EXAMPLE">{{ COORDINATE_EXAMPLE }}</button>
        </div>
      </form>

      <FilterBuilder v-model="builtFilter" :scope="scope" :busy="loading" @search="submitFilter" />

      <div class="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-3">
        <SearchAccount :usage="usage" @usage="usage = $event" />
        <SearchHistory ref="history" :presets="presets" @open="(id) => router.push({ path: '/', query: { s: id } })" />
      </div>

      <div v-if="presets.length && !site.config.searchCosts?.presets" class="search-hint text-center mt-3">{{ $t('home.search.presets_free') }}</div>
      <div v-if="presets.length" class="presets d-flex gap-2 justify-content-md-center" :class="site.config.searchCosts?.presets ? 'mt-3' : 'mt-1'">
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

      <section v-if="loading" class="text-center mt-4 text-muted">
        {{ $t('home.search.searching') }}
      </section>

      <section v-else-if="result" class="mt-4">
        <template v-if="result.status === 'ok' || result.status === 'searching'">
          <div class="mb-3">
            <!-- With a filter the conditions are the pills above; only notes stay here. -->
            <template v-if="!result.filter">
              <div class="small text-body-secondary mb-1">{{ $t('home.search.read_as') }}</div>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="line in result.description" :key="line" class="read-as-chip">{{ line }}</span>
                <span v-if="!result.description.length" class="read-as-chip">{{ $t('home.search.any_world') }}</span>
              </div>
            </template>
            <div v-else v-for="line in resultNotes" :key="line" class="small text-warning-emphasis mb-1">{{ line }}</div>
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
            <div v-for="(world, i) in result.worlds" :key="world.coordinate" class="col-12 col-sm-6 col-xl-4">
              <WorldCard :world="world" :highlight="result.highlight" :search-id="result.searchId" :rank="i" />
            </div>
          </div>
          <AdSlot v-if="result.worlds?.length" placement="results" />
          <div v-if="result.hasMore" ref="moreSentinel" class="text-center my-4">
            <span v-if="loadingMore" class="spinner-border spinner-border-sm text-secondary" role="status">
              <span class="visually-hidden">{{ $t('home.search.loading_more') }}</span>
            </span>
            <button v-else type="button" class="btn btn-sm btn-outline-secondary" @click="loadMore">
              {{ $t('home.search.show_more') }}
            </button>
          </div>
        </template>

        <!-- A bare seed: the worlds we have with it, then the seed on each cluster. -->
        <template v-else-if="result.status === 'seed'">
          <h2 class="h6">{{ $t('home.search.seed_title', { seed: result.seed }) }}</h2>
          <div v-if="result.worlds.length" class="row g-3 mb-4">
            <div v-for="(world, i) in result.worlds" :key="world.coordinate" class="col-12 col-sm-6 col-xl-4">
              <WorldCard :world="world" :highlight="null" :search-id="result.searchId" :rank="i" />
            </div>
          </div>
          <p class="small text-body-secondary mb-2">{{ $t('home.search.seed_clusters') }}</p>
          <div class="d-flex flex-wrap gap-2">
            <router-link
              v-for="c in result.candidates"
              :key="c.coordinate"
              :to="`/world/${c.coordinate}`"
              class="btn btn-sm"
              :class="c.generated ? 'btn-outline-secondary' : 'btn-outline-secondary disabled'"
              :title="c.generated ? c.coordinate : $t('home.search.seed_unsupported')"
            >
              {{ c.name }}
            </router-link>
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
      <StoreLinks v-if="site.config.affiliate?.homeStrip" class="home-store mt-4" />
      <SupportLinks />
      <p class="text-center small mt-3 mb-0"><router-link to="/privacy">{{ $t('privacy.link') }}</router-link></p>
      <AdSlot placement="sidebar" />
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
.search-hint {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
}
.example-code {
  font-family: var(--bs-font-monospace);
  font-size: 0.85rem;
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
