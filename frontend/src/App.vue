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
  mounted() {
    console.log("App mounted");

    this.$router.isReady().then(() => {
      const token = this.$route.query.token;
      if (token) {
        useUserStore().setToken(token);
        this.$router.replace({ query: {} });
      }
    });
  }
}
</script>