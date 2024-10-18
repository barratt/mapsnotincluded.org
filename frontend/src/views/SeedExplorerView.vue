<script setup>
import { ref } from 'vue';

// Define a reactive variable using ref
const seedInput = ref("0000-0-0-0-0");

const submit = () => {
    //add api code here
    console.log('submitted: ', seedInput.value);
};
</script>

<template>
  <main class="container mt-5">
    <h1>Seed Explorer</h1>
    <p>Input a seed, and see whether our database has it and you can explore the map!</p>

    
    <div>
        <label for="seedInput">Seed: </label> <br>
        <input type="text" v-model="seedInput" size="40">
        <br>
        <button @click="submit">Submit</button>
    </div>
    

    
  </main>
</template>
