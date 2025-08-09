<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
</script>

<template>
  <!-- Bootstrap 5 navbar -->
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <router-link to="/" class="navbar-brand"><img src="@/assets/logo.png" style="max-height: 40px" class="me-2" />{{
        $t("navbar.title")
      }}</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/map-explorer" class="nav-link">{{
              $t("navbar.map_explorer_link")
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/trait-finder" class="nav-link">{{
              $t("navbar.world_trait_finder_link")
            }}</router-link>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/contribute" class="nav-link">{{
              $t("navbar.contribute_link")
            }}</router-link>
          </li>
          <li class="nav-item">
            <a href="https://discord.gg/3vhCpp6PNq" target="mni_gh" class="nav-link">{{
              $t("navbar.discord_link")
            }}</a>
          </li>
          <li class="nav-item">
            <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_disc" class="nav-link">{{
              $t("navbar.github_link") }}</a>
          </li>
          <div class="nav-link my-auto">
            <button v-if="isAuthenticated" @click="requestCoordinate" class="btn btn-sm btn-primary">
              {{ $t("coordinate_request_dialog.title") }}
            </button>
            <a v-else :href="loginUrl">
              <img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png" />
            </a>
          </div>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from "@/stores";
import { requestCoordinate } from "./CoordinateRequestDialog";
export default {
  data() {
    return {
      loginUrl: `https://steam.auth.stefanoltmann.de/login?redirect=https://mapsnotincluded.org`,
    };
  },
  computed: {
    // Accessing the isAuthenticated getter from the store
    isAuthenticated() {
      return useUserStore().isAuthenticated;
    },
  },
  methods: {},
};
</script>

<style scoped>
.navbar {
  background-color: #4f5f80;
}

.nav-item {
  display: flex;
  align-items: center;
  position: relative;
}

.locale-button {
  background-color: transparent;
  border: none;
}

.locale-dropdown {
  position: absolute;
  bottom: 0px;
  left: 0px;
  transform: translateY(100%);
  background-color: #4f5f80;
  border: 1px solid #b4bdd1;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.locale-dropdown-item {
  padding: 3px 10px;
  margin: 0px;
}

.locale-dropdown-item:hover {
  cursor: pointer;
  background-color: #43516d;
  border-radius: 4px;
}

.locale-selected {
  background-color: #43516d;
  border-radius: 4px;
}

.locale-text {
  font-size: 18px;
  white-space: nowrap;
}
</style>
