<script setup>
import { onMounted, ref, watch } from 'vue'
import { api, steamSignInUrl } from '@/searchApi'

// Favourite (star a world for your own list, needs Steam sign-in) and
// "Report issue" (anyone: bad world generation, a broken map, ...).
const props = defineProps({
  coordinate: { type: String, required: true },
})

const fav = ref({ favourite: false, favourites: 0, signedIn: false, loaded: false })
async function loadFavourite() {
  const { ok, data } = await api(`/worlds/${encodeURIComponent(props.coordinate)}/favourite`).catch(() => ({ ok: false }))
  if (ok) fav.value = { ...data, loaded: true }
}
async function toggleFavourite() {
  if (!fav.value.signedIn) {
    window.location.href = steamSignInUrl()
    return
  }
  const was = fav.value.favourite
  fav.value = { ...fav.value, favourite: !was, favourites: fav.value.favourites + (was ? -1 : 1) }
  const { ok } = await api(`/worlds/${encodeURIComponent(props.coordinate)}/favourite`, { method: was ? 'DELETE' : 'POST', body: was ? undefined : {} })
  if (!ok) loadFavourite()
}

const CATEGORIES = ['bad_worldgen', 'wrong_geysers', 'map_problem', 'wrong_details', 'other']
const report = ref({ open: false, category: 'bad_worldgen', description: '', sending: false, sent: false, error: null })
function openReport() {
  report.value = { open: true, category: 'bad_worldgen', description: '', sending: false, sent: false, error: null }
}
async function sendReport() {
  report.value.sending = true
  report.value.error = null
  const { ok, data } = await api(`/worlds/${encodeURIComponent(props.coordinate)}/report`, {
    method: 'POST',
    body: { category: report.value.category, description: report.value.description },
  }).catch(() => ({ ok: false, data: {} }))
  report.value.sending = false
  if (ok) report.value.sent = true
  else report.value.error = data?.message ?? null
}

onMounted(loadFavourite)
watch(() => props.coordinate, loadFavourite)
</script>

<template>
  <button
    type="button"
    class="btn btn-sm"
    :class="fav.favourite ? 'btn-warning' : 'btn-outline-light'"
    :aria-pressed="fav.favourite"
    :title="fav.signedIn ? '' : $t('world.actions.favourite_sign_in')"
    @click="toggleFavourite"
  >
    <i class="bi" :class="fav.favourite ? 'bi-star-fill' : 'bi-star'" aria-hidden="true"></i>
    {{ fav.favourite ? $t('world.actions.favourited') : $t('world.actions.favourite') }}
    <span v-if="fav.favourites" class="fav-count">{{ fav.favourites }}</span>
  </button>
  <button type="button" class="btn btn-sm btn-outline-secondary" @click="openReport">
    <i class="bi bi-flag me-1" aria-hidden="true"></i>{{ $t('world.actions.report') }}
  </button>

  <Teleport to="body">
    <div v-if="report.open" class="report-backdrop" @click.self="report.open = false">
      <div class="report-dialog sb-panel" role="dialog" aria-modal="true" :aria-label="$t('world.actions.report_title')">
        <h2 class="sb-heading mb-2">{{ $t('world.actions.report_title') }}</h2>
        <template v-if="!report.sent">
          <p class="small text-body-secondary">{{ $t('world.actions.report_intro', { coordinate }) }}</p>
          <label class="form-label small mb-1" for="report-category">{{ $t('world.actions.report_kind') }}</label>
          <select id="report-category" v-model="report.category" class="form-select form-select-sm mb-2">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ $t(`world.actions.categories.${c}`) }}</option>
          </select>
          <label class="form-label small mb-1" for="report-description">{{ $t('world.actions.report_describe') }}</label>
          <textarea
            id="report-description"
            v-model="report.description"
            class="form-control form-control-sm"
            rows="5"
            maxlength="2000"
            :placeholder="$t('world.actions.report_placeholder')"
          ></textarea>
          <div v-if="report.error" class="text-danger small mt-2">{{ report.error }}</div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="report.open = false">{{ $t('world.actions.cancel') }}</button>
            <button type="button" class="btn btn-sm btn-warning" :disabled="report.sending || report.description.trim().length < 5" @click="sendReport">
              {{ $t('world.actions.send') }}
            </button>
          </div>
        </template>
        <template v-else>
          <p>{{ $t('world.actions.report_thanks') }}</p>
          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-sm btn-warning" @click="report.open = false">{{ $t('world.actions.close') }}</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fav-count {
  margin-left: 0.3rem;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
}
.report-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
}
.report-dialog {
  width: min(32rem, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 1rem 1.25rem;
  border: 1px solid var(--sb-border, #3a3f47);
  border-radius: 10px;
  background: #222529;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}
</style>
