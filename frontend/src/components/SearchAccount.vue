<script setup>
import { onMounted, ref } from 'vue'
import { api, getSession, signOut, steamSignInUrl } from '@/searchApi'

// Under the search box: today's remaining searches and Steam sign-in, which
// raises the daily limit. The parent passes the usage from its latest search
// response so the count updates without another request.
const props = defineProps({
  usage: { type: Object, default: null },
})
const emit = defineEmits(['usage'])

const me = ref(null)

async function load() {
  if (getSession()) {
    const { data } = await api('/me').catch(() => ({ data: null }))
    me.value = data?.signedIn ? data : null
  }
  const { ok, data } = await api('/usage').catch(() => ({ ok: false }))
  if (ok) emit('usage', data)
}

function doSignOut() {
  signOut()
  me.value = null
  load()
}

onMounted(load)
</script>

<template>
  <div class="search-account small text-body-secondary">
    <template v-if="props.usage">
      <span v-if="props.usage.remaining > 0">
        {{ $t(me ? 'home.search.left_signed_in' : 'home.search.left_anon', { remaining: props.usage.remaining, limit: props.usage.limit }) }}
      </span>
      <span v-else>{{ $t('home.search.none_left') }}</span>
    </template>

    <span v-if="me" class="signed-in">
      <img v-if="me.avatarUrl" :src="me.avatarUrl" alt="" class="avatar" />
      {{ $t('home.search.signed_in_as', { name: me.displayName ?? 'Steam' }) }}
      <button type="button" class="btn btn-link btn-sm p-0 align-baseline" @click="doSignOut">{{ $t('home.search.sign_out') }}</button>
    </span>
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
  gap: 0.4rem 0.9rem;
  margin-top: 0.75rem;
}
.signed-in {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}
.steam-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
