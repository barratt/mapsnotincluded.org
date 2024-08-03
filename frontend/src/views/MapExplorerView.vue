<script setup>

</script>

<template>
  <main>
    <div class="mb-5">
      <h1>Map Explorer</h1>
    </div>

    <!-- Lets add the option to select between different DLCs -->
    <div class="d-flex gap-5 justify-content-center flex-wrap">
      <Selectable :items="DLCs" v-model="form.selectedDLC" />
    </div>

    <!-- Lets add the option to select between different worlds -->
    <div class="d-flex gap-5 justify-content-center" v-if="selectedCluster">
      <Selectable :items="selectedCluster" v-model="form.selectedWorld" />
    </div>

    <div class="d-flex justify-content-center mt-5">
      {{ saveCount }} seeds indexed
    </div>

    <hr class="mt-5"/>

    <div v-for="(criteria, i) in form.criteria" :key="i">
      <div class="input-group mb-3">
        <select class="form-select " id="" v-model="criteria.type">
          <option disabled value="" selected>Type</option>
          <option value="Cluster">Cluster</option>
          <option value="Asteroid">Asteroid</option>
        </select>
        
        <select class="form-select " id="" v-model="criteria.attribute">
          <option disabled value="" selected>Attribute</option>
          <option value="WorldTrait">World Trait</option>
          <option value="Biome">Biome</option>
          <
          <option value="Geyser">Geyser</option>
          <option value="GeyserOutput">Geyser Output</option>
          <option value="SpaceDestination">Space Destination</option>
        </select>

        <select v-if="criteria.attribute == 'Biome'" class="form-select " id="">
          <option disabled value="" selected>Biome</option>
          <option value="ColdBiome">Cold Biome</option>
          <option value="HotBiome">Hot Biome</option>
          <option value="TemperateBiome">Temperate Biome</option>
          <option value="Terra">Terra</option>
          <option value="Swamp">Swamp</option>
          <option value="Forest">Forest</option>
          <option value="Volcano">Volcano</option>
          <option value="Salt">Salt</option>
          <option value="Desert">Desert</option>
          <option value="Ice">Ice</option>
          <option value="Ocean">Ocean</option>
          <option value="Arid">Arid</option>
          <option value="Rust">Rust</option>
          <option value="Badlands">Badlands</option>
          <option value="Rocky">Rocky</option>
          <option value="Metallic">Metallic</option>
          <option value="Radioactive">Radioactive</option>
          <option value="Frozen">Frozen</option>
          <option value="Asteroid">Asteroid</option>
          <option value="Vacuum">Vacuum</option>
          <option value="SpaceDestination">Space Destination</option>
        </select>

        <select class="form-select " id="">
          <option disabled value="" selected>Operator</option>
          <option value=">">at least</option>
          <option value="<">at most</option>
          <option value="=">exactly</option>
        </select>



      </div>

    </div>

  </main>
</template>

<script>
import { DLCs, VanillaWorlds, SpacedOutWorlds, FrostyPlanetWorlds } from '@/oni';
import Selectable from '@/components/Selectable.vue';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: 'MapExplorerView',
  data() {
    return {
      DLCs,
      saveCount: 0,
      form: {
        selectedWorld: null,
        selectedDLC: null,
        criteria: [
          {

          }
        ],
      }
    };
  },
  components: {
    Selectable,
  },
  computed: {
    selectedCluster() {
      console.log("selectedCluster", this.form.selectedDLC);
      if (!this.form.selectedDLC) {
        return null;
      }

      const name = this.form.selectedDLC.name;
      console.log('selectedCluster', name);
      if (name === 'Vanilla') {
        return VanillaWorlds;
      } else if (name === 'Spaced Out!') {
        return SpacedOutWorlds;
      } else if (name == 'Frosty Planet') {
        return FrostyPlanetWorlds;
      } else {
        return null;
      }
    }
  },
  mounted() {
    this.getSaveCount();
    setInterval(this.getSaveCount, 2000);
  },
  methods: {
    addCriteria() {
      this.form.criteria.push({});
    },
    removeCriteria(index) {
      this.form.criteria.splice(index, 1);
    },

    getSaveCount() {
      console.log('getCount');
      const url = `${API_URL}/saves/count`;
      console.log('url', url);
      // worldId is a query parameter.
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log('data', data);
          this.saveCount = data.count;
        });
    }
  }
};


</script>
