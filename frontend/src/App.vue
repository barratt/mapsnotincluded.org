<template>

  <Navbar></Navbar>

  <div> <!-- Lets just throw away half the screen -->
    <RouterView />
  </div>
</template>

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
    // Check if token is in query params usign route.query
    if (this.$route.query.token) {
      // Set the token in the store
      useUserStore().setToken(this.$route.query.token);
      // Remove the token from the query params
      this.$router.replace({ query: {} });
    }
  }
}
</script>