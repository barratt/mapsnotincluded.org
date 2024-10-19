<script setup>
import { ref } from 'vue';

const seedInput = ref("0000-0-0-0-0");

const submit = () => {
    // TODO add api code here
    console.log('submitted: ', seedInput.value);
};
</script>

<template>
  <main class="container mt-5">
    <h1>{{ $t('seed_viewer.title') }}</h1>
    <p>{{ $t('seed_viewer.description_1') }}</p>
    <h2 style="color: #FF0000;"><strong>{{ $t('seed_viewer.description_2') }}</strong></h2>
    <div>
      <label for="seedInput">{{ $t('seed_viewer.seed') }}: </label> <br>
      <input type="text" v-model="seedInput" size="40">
      <br>
      <button @click="submit">{{ $t('seed_viewer.submit') }}</button>
    </div>
  </main>
</template>
