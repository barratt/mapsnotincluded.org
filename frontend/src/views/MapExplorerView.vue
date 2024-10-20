<script setup>

</script>

<template>
  <main class="container mt-5">
    <div class="mb-5">
      <h1>{{ $t('map_explorer.title') }}</h1>
    </div>

    <!-- Lets add the option to select between different DLCs -->
    <div class="d-flex gap-5 justify-content-center flex-wrap">
      <Selectable :items="DLCs" v-model="selectedDLC" />
    </div>

    <!-- Lets add the option to select between different worlds -->
    <div class="d-flex gap-5 justify-content-center flex-wrap" v-if="selectedCluster">
      <Selectable :items="selectedCluster" v-model="form.selectedWorld" />
    </div>

    <div class="d-flex justify-content-center mt-5">
      {{ saveCount }} seeds indexed
    </div>

    <hr class="mt-5"/>

    <div class="d-flex justify-content-center mb-3">
      <button class="btn btn-success"><i class="bi-plus" @click="addCriteria"></i></button>
    </div>


    <div v-for="(criteria, i) in form.criteria" :key="i">
      <div class="input-group mb-3">
        <select class="form-select " id="" v-model="criteria.type">
          <option disabled value="" selected>{{ $t('map_explorer.type.title') }}</option>
          <option value="Cluster">{{ $t('map_explorer.type.cluster') }}</option>
          <option value="Asteroid">{{ $t('map_explorer.type.asteroid') }}</option>
        </select>
        
        <select class="form-select " id="" v-model="criteria.attribute">
          <option disabled value="" selected>{{ $t('map_explorer.attribute.title') }}</option>
          <option value="WorldTrait">{{ $t('map_explorer.attribute.world_trait') }}</option>
          <option value="Biome">{{ $t('map_explorer.attribute.biome') }}</option>
          <option value="Geyser">{{ $t('map_explorer.attribute.geyser') }}</option>
          <option value="GeyserOutput">{{ $t('map_explorer.attribute.geyser_output') }}</option>
          <option value="SpaceDestination">{{ $t('map_explorer.attribute.geyser_destination') }}</option>
        </select>

        <select v-if="criteria.attribute == 'Biome'" class="form-select " id="">
          <option disabled value="" selected>{{ $t('map_explorer.biome.title') }}</option>
          <option value="ColdBiome">{{ $t('map_explorer.biome.cold_biome') }}</option>
          <option value="HotBiome">{{ $t('map_explorer.biome.hot_biome') }}</option>
          <option value="TemperateBiome">{{ $t('map_explorer.biome.temperate_biome') }}</option>
          <option value="Terra">{{ $t('map_explorer.biome.terra') }}</option>
          <option value="Swamp">{{ $t('map_explorer.biome.swamp') }}</option>
          <option value="Forest">{{ $t('map_explorer.biome.forest') }}</option>
          <option value="Volcano">{{ $t('map_explorer.biome.volcano') }}</option>
          <option value="Salt">{{ $t('map_explorer.biome.salt') }}</option>
          <option value="Desert">{{ $t('map_explorer.biome.desert') }}</option>
          <option value="Ice">{{ $t('map_explorer.biome.ice') }}</option>
          <option value="Ocean">{{ $t('map_explorer.biome.ocean') }}</option>
          <option value="Arid">{{ $t('map_explorer.biome.arid') }}</option>
          <option value="Rust">{{ $t('map_explorer.biome.rust') }}</option>
          <option value="Badlands">{{ $t('map_explorer.biome.badlands') }}</option>
          <option value="Rocky">{{ $t('map_explorer.biome.rocky') }}</option>
          <option value="Metallic">{{ $t('map_explorer.biome.metallic') }}</option>
          <option value="Radioactive">{{ $t('map_explorer.biome.radioactive') }}</option>
          <option value="Frozen">{{ $t('map_explorer.biome.frozen') }}</option>
          <option value="Asteroid">{{ $t('map_explorer.biome.asteroid') }}</option>
          <option value="Vacuum">{{ $t('map_explorer.biome.vacuum') }}</option>
          <option value="SpaceDestination">{{ $t('map_explorer.biome.space_destination') }}</option>
        </select>

        <select class="form-select " id="">
          <option disabled value="" selected>{{ $t('map_explorer.operator.title') }}</option>
          <option value=">">{{ $t('map_explorer.operator.at_least') }}</option>
          <option value="<">{{ $t('map_explorer.operator.at_most') }}</option>
          <option value="=">{{ $t('map_explorer.operator.exactly') }}</option>
        </select>

        <input type="number" class="form-control" placeholder="Value" v-model="criteria.value">

        <button v-if="i > 0" class="btn btn-danger" @click="removeCriteria(i)"><i class="bi-x"></i></button>
      </div>
    </div>

    <!-- <div class="d-flex justify-content-center">
      <button class="btn btn-success"><i class="bi-plus" @click="addCriteria"></i></button>
    </div> -->
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
      selectedDLC: DLCs[0],
      saveCount: 0,
      form: {
        selectedWorld: null,
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
        console.log('no selectedDLC');
        return null;
      }

      const id = this.form.selectedDLC.id;

      if (id === 'Vanilla') {
        return VanillaWorlds;
      } else if (id === 'Spaced Out!') {
        return SpacedOutWorlds;
      } else if (id == 'Frosty Planet') {
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
      fetch(url + "?" + (new URLSearchParams({
        [this.selectedDLC.id]: true,
      })).toString(), {
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('data', data);
          this.saveCount = data.count;
        });
    }
  },
  watch: {
    selectedDLC() {
      this.saveCount = ''
      this.getSaveCount();
    },
  },
};


</script>
