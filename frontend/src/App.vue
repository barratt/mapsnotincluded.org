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