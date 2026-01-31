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
import Navbar from '@/components/Navbar.vue'
import { RouterView } from 'vue-router'
</script>

<script>
import { useUserStore } from './stores';


export default {
  data() { 
    return {};
  },
  methods: {
    handleLogoutHash() {
      if (window.location.hash === '#logout') {
        useUserStore().clearToken();
        const url = new URL(window.location.href);
        url.hash = '';
        window.history.replaceState({}, '', url);
        return true;
      }
      return false;
    }
  },
  mounted() {
    console.log("App mounted");

    this.$router.isReady().then(() => {
      if (this.handleLogoutHash()) {
        return;
      }
      const token = this.$route.query.token;
      if (token) {
        useUserStore().setToken(token);
        this.$router.replace({ query: {} });
      }
    });

    window.addEventListener('hashchange', this.handleLogoutHash);
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.handleLogoutHash);
  }
}
</script>
