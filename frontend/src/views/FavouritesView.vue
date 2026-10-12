<script setup>
import { onMounted, ref } from 'vue'
import { api, getSession, steamSignInUrl } from '@/searchApi'
import WorldCard from '@/components/WorldCard.vue'

// The worlds a signed-in user has starred, newest first.
const state = ref('loading') // loading | signed_out | ready | error
const worlds = ref([])
const other = ref([])

onMounted(async () => {
  if (!getSession()) {
    state.value = 'signed_out'
    return
  }
  const { ok, status, data } = await api('/me/favourites').catch(() => ({ ok: false }))
  if (status === 401) state.value = 'signed_out'
  else if (!ok) state.value = 'error'
  else {
    worlds.value = data.worlds ?? []
    other.value = data.other ?? []
    state.value = 'ready'
  }
})
</script>

<template>
  <main class="container py-4">
    <h1 class="mb-3">{{ $t('favourites.title') }}</h1>
    <div v-if="state === 'loading'" class="text-body-secondary">{{ $t('favourites.loading') }}</div>
    <div v-else-if="state === 'signed_out'" class="sb-panel">
      <p>{{ $t('favourites.sign_in') }}</p>
      <a :href="steamSignInUrl()" class="btn btn-sm btn-outline-light"><i class="bi bi-steam me-1" aria-hidden="true"></i>{{ $t('favourites.sign_in_button') }}</a>
    </div>
    <div v-else-if="state === 'error'" class="alert sb-alert">{{ $t('favourites.error') }}</div>
    <template v-else>
      <p v-if="!worlds.length && !other.length" class="text-body-secondary">{{ $t('favourites.empty') }}</p>
      <div class="row g-3">
        <div v-for="w in worlds" :key="w.coordinate" class="col-12 col-md-6 col-xl-4">
          <WorldCard :world="w" />
        </div>
      </div>
      <ul v-if="other.length" class="list-unstyled mt-3">
        <li v-for="c in other" :key="c">
          <router-link :to="`/world/${c}`" class="font-monospace">{{ c }}</router-link>
        </li>
      </ul>
    </template>
  </main>
</template>
