<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { api, getSession, signOut, steamSignInUrl } from '@/searchApi'

// Under the search box, next to "Recent searches": today's remaining
// searches, and either a Steam sign-in button (which raises the daily limit)
// or the account menu (favourites, sign out). The parent passes the usage from
// its latest search response so the count updates without another request.
const props = defineProps({
  usage: { type: Object, default: null },
})
const emit = defineEmits(['usage'])

const me = ref(null)
const open = ref(false)
const root = ref(null)

async function load() {
  if (getSession()) {
    const { data } = await api('/me').catch(() => ({ data: null }))
    me.value = data?.signedIn ? data : null
  }
  const { ok, data } = await api('/usage').catch(() => ({ ok: false }))
  if (ok) emit('usage', data)
}

function doSignOut() {
  open.value = false
  signOut()
  me.value = null
  load()
}

// Close the menu on any click outside it, or Escape.
const outside = (e) => {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}
const escape = (e) => e.key === 'Escape' && (open.value = false)

onMounted(() => {
  load()
  document.addEventListener('click', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <div ref="root" class="search-account">
    <span v-if="props.usage" class="usage-pill" :class="{ empty: props.usage.remaining <= 0 }" :title="$t('home.search.usage_hint', { limit: props.usage.limit })">
      <i class="bi bi-search" aria-hidden="true"></i>
      {{ props.usage.remaining > 0 ? $t('home.search.left_short', { remaining: props.usage.remaining }) : $t('home.search.none_left') }}
    </span>

    <div v-if="me" class="account">
      <button type="button" class="btn btn-sm btn-outline-secondary account-button" :aria-expanded="open" aria-haspopup="menu" @click="open = !open">
        <img v-if="me.avatarUrl" :src="me.avatarUrl" alt="" class="avatar" />
        <i v-else class="bi bi-person-circle" aria-hidden="true"></i>
        <span class="account-name">{{ me.displayName ?? 'Steam' }}</span>
        <i class="bi bi-chevron-down small" aria-hidden="true"></i>
      </button>
      <div v-if="open" class="account-menu" role="menu">
        <div class="account-menu-head">{{ $t('home.search.signed_in_as', { name: me.displayName ?? 'Steam' }) }}</div>
        <router-link to="/favourites" class="account-menu-item" role="menuitem" @click="open = false">
          <i class="bi bi-star" aria-hidden="true"></i>{{ $t('favourites.link') }}
        </router-link>
        <button type="button" class="account-menu-item" role="menuitem" @click="doSignOut">
          <i class="bi bi-box-arrow-right" aria-hidden="true"></i>{{ $t('home.search.sign_out') }}
        </button>
      </div>
    </div>
    <a v-else :href="steamSignInUrl()" class="btn btn-sm btn-outline-light steam-button">
      <i class="bi bi-steam" aria-hidden="true"></i>
      {{ $t('home.search.sign_in_more', { n: props.usage?.signedInLimit ?? 10 }) }}
    </a>
  </div>
</template>

<style scoped>
.search-account {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.usage-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.7rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
  white-space: nowrap;
}
.usage-pill.empty {
  color: var(--bs-warning);
  border-color: var(--bs-warning);
}
.account {
  position: relative;
}
.account-button,
.steam-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.account-name {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}
.account-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  min-width: 13rem;
  padding: 0.35rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  background: #222529;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  text-align: left;
}
.account-menu-head {
  padding: 0.35rem 0.6rem 0.45rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid var(--bs-border-color);
  color: var(--bs-secondary-color);
  font-size: 0.8rem;
}
.account-menu-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--bs-body-color);
  font-size: 0.95rem;
  text-decoration: none;
  text-align: left;
}
.account-menu-item:hover,
.account-menu-item:focus-visible {
  background: rgba(255, 255, 255, 0.07);
  color: var(--bs-body-color);
}
</style>
