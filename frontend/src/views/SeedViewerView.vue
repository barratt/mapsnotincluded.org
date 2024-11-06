<script setup>
import { ref } from "vue";

const seedInput = ref("0000-0-0-0-0");

const submit = () => {
  // TODO add api code here
  console.log("submitted: ", seedInput.value);
};
</script>

<template>
  <main class="container mt-5">
    <h1>{{ $t("seed_viewer.title") }}</h1>
    <p>{{ $t("seed_viewer.description_1") }}</p>
    <div>
      <form v-on:submit.prevent="submit">
        <p>{{ $t("seed_viewer.seed") }}
          <input type="text" v-model="seedInput" size="40" required />
          <button  type="submit">{{ $t("seed_viewer.submit") }}</button>
        </p>
      </form>
    </div>
  </main>
</template>
