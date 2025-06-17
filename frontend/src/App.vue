<!--
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
-->

<template>

  <Navbar></Navbar>

  <div> <!-- Lets just throw away half the screen -->
    <RouterView />
  </div>
  
  <BetaFooter />
</template>

<style>
body {
    overscroll-behavior: none;
}
</style>

<script setup>
import Navbar from '@/components/Navbar.vue'
import BetaFooter from '@/components/BetaFooter.vue'

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