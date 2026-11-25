<script setup>
import { onMounted, ref } from 'vue'
import WorldCard from '@/components/WorldCard.vue'
import { SEARCH_API_URL, api } from '@/searchApi'

// The ten most-starred worlds. The API caches the ranking for a minute.
const top = ref(null)
const failed = ref(false)

onMounted(async () => {
  if (!SEARCH_API_URL) {
    failed.value = true
    return
  }
  const { ok, data } = await api('/worlds/favourites/top')
  if (ok) top.value = data.top
  else failed.value = true
})
</script>

<template>
  <main class="container mt-5">
    <h1><i class="bi bi-trophy-fill text-warning me-2" aria-hidden="true"></i>{{ $t('leaderboard.title') }}</h1>
    <p class="text-body-secondary">{{ $t('leaderboard.description') }}</p>

    <div v-if="failed" class="alert alert-warning">{{ $t('leaderboard.failed') }}</div>
    <div v-else-if="!top" class="text-center mt-4 text-muted">
      <span class="spinner-border spinner-border-sm" role="status"></span>
    </div>
    <p v-else-if="!top.length" class="text-body-secondary">{{ $t('leaderboard.empty') }}</p>

    <ol v-else class="row g-3 list-unstyled">
      <li v-for="(entry, i) in top" :key="entry.coordinate" class="col-12 col-sm-6 col-xl-4 d-flex flex-column">
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="leaderboard-rank" :class="`rank-${i + 1}`">#{{ i + 1 }}</span>
          <span class="text-body-secondary small">
            <i class="bi bi-star-fill text-warning" aria-hidden="true"></i>
            {{ $t('leaderboard.favourites', { n: entry.favourites }, entry.favourites) }}
          </span>
        </div>
        <WorldCard v-if="entry.world" :world="entry.world" class="flex-grow-1" />
        <router-link v-else :to="`/world/${entry.coordinate}`" class="leaderboard-other flex-grow-1">
          {{ entry.coordinate }}
        </router-link>
      </li>
    </ol>
  </main>
</template>

<style scoped>
.leaderboard-rank {
  font-weight: 700;
  font-size: 1.1rem;
}
.rank-1 {
  color: #ffc107;
}
.rank-2 {
  color: #c0c6cf;
}
.rank-3 {
  color: #cd7f32;
}
.leaderboard-other {
  display: block;
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  background: var(--bs-tertiary-bg);
  word-break: break-all;
}
</style>
