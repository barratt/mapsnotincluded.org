<script setup>

</script>

<template>
  <main class="container mt-5">
    <h1>Seed Explorer</h1>
    <p>Input a seed, and see whether our database has it and you can explore the map!</p>
    <label for="seedInput">Seed: </label> <br>
    <input type="text" id="seedInput" name="seedInput">
    <input type="submit" value="Submit">
    <br>
    <p>You can also <router-link to="/contribute">contribute</router-link> to the development of this website.</p>
  </main>
</template>
