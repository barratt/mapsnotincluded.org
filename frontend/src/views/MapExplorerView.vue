<script setup>

</script>

<template>
  <main>
    <div>
      <h1>Map Explorer</h1>
    </div>

    <!-- Lets add the option to select between different DLCs -->
    <div class="d-flex gap-5 justify-content-center">
      <Selectable :items="DLCs" v-model="form.selectedDLC" />
    </div>


  </main>
</template>

<script>
import { DLCs } from '@/oni';
import Selectable from '@/components/Selectable.vue';

export default {
  name: 'MapExplorerView',
  setup() {
    return {
      DLCs,
      form: {
        selectedDLC: null,
      }
    };
  },
  components: {
    Selectable,
  },
};


</script>
