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
    <h1>Seed Explorer</h1>
    <p>Input a seed, and see whether our database has it and you can explore the map!</p>

    <h2 style="color: #FF0000;"><strong>THIS IS NOT WORKING YET!!!</strong></h2>

    
    <div>
        <label for="seedInput">Seed: </label> <br>
        <input type="text" v-model="seedInput" size="40">
        <br>
        <button @click="submit">Submit</button>
    </div>
    

    
  </main>
</template>
