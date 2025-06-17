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
  <transition name="fade">
    <footer v-if="visible && shouldShow" class="beta-footer">
      <span>
        Try the new beta version of the map explorer
        <RouterLink to="/beta/map-explorer" class="link">here</RouterLink>.
      </span>
      <button class="close-button" @click="dismiss">✕</button>
    </footer>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const visible = ref(true)
const route = useRoute()

// Only show on routes explicitly marked with meta.showBetaFooter
const shouldShow = computed(() => {
  return route.meta.showBetaFooter === true
})

function dismiss() {
  visible.value = false
}
</script>

<style scoped>
.beta-footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: #111;
  color: #fff;
  text-align: center;
  padding: 0.5rem 2rem;
  font-size: 2rem;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.3);
}

.link {
  color: #7fbcff;
  text-decoration: underline;
}
.link:hover {
  color: #a9d5ff;
}

.close-button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.close-button:hover {
  color: #fff;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
