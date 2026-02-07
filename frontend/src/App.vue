<template>

  <Navbar></Navbar>

  <div> <!-- Lets just throw away half the screen -->
    <RouterView />
  </div>
</template>

<style>
body {
    overscroll-behavior: none;
}
</style>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from './stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

function handleLogoutHash() {
  if (window.location.hash === '#logout') {
    userStore.clearToken()
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState({}, '', url)
    return true
  }
  return false
}

onMounted(() => {
  router.isReady().then(() => {
    if (handleLogoutHash()) {
      return
    }
    const token = route.query.token
    if (token) {
      userStore.setToken(token)
      router.replace({ query: {} })
    }
  })

  window.addEventListener('hashchange', handleLogoutHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleLogoutHash)
})
</script>
