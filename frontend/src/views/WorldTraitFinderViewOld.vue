<script setup>

</script>

<template>
  <main class="container mt-5">
    <div class="mb-5">
      <h1>{{ $t('world_trait_finder.title') }}</h1>
      <!-- <p>This uses our database to search for existing seeds that contain specific traits, this does seem to be calculatable based on the coordinates, but is not yet known. We hope to get this working soon! If you have any information regarding this, please get in touch on Discord!</p> -->
      <p class="text-danger fs-1">{{ $t('world_trait_finder.description_1') }}</p>
      <i18n-t keypath="world_trait_finder.description_2" tag="p">
        <template v-slot:contribute>
          <router-link to="/contribute">{{ $t('world_trait_finder.link.contribute') }}</router-link>
        </template>
      </i18n-t>
    </div>
    <!-- Lets add the option to select between different DLCs -->
    <!-- <div class="d-flex gap-5 justify-content-center flex-wrap">
      <Selectable :items="DLCs" v-model="selectedDLC"  />
    </div> -->

    <!-- Lets add the option to select between different worlds -->
    <div class="d-flex gap-5 justify-content-center flex-wrap mt-5" v-if="selectedCluster">
      <Selectable :items="selectedCluster" v-model="form.selectedWorld"  />
    </div>

    <!-- TODO: Some way of turning on the good and the bad traits. -->
    <hr/>
    <div class="row text-center mt-5">
      <div class="col-12 col-md-4">
        <span class="text-danger">{{ negativeWorldTraits.length }} Negative Traits</span>

        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="negativeTraits" v-model="selectedTraits" :multiselect="true" selected-text-class="text-danger"/>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <span class="">{{ neutralWorldTraits.length }} Neutral Traits</span>
        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="neutralTraits" v-model="selectedTraits" :multiselect="true" selected-text-class="text-info"/>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <span class="text-success">{{ positiveWorldTraits.length }} Positive Traits</span>
        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="positiveTraits" v-model="selectedTraits" :multiselect="true" selected-text-class="text-success"/>
        </div>
      </div>


    </div>

    <hr/>

    <div class="d-flex justify-content-center mt-3 mb-5">
      <button class="btn btn-success" @click="generate" :disabled="isLoading"><i class="bi-search me-2"></i>Generate</button>
    </div>

    <div v-if="results" class="mt-5">
      <hr />
      <h2>{{ results.length}} Results</h2>
      <div class="row">
        <div class="col-12">
          <table class="table">
            <thead>
              <tr>
                <th>World</th>
                <th>Traits</th>
               <th></th>
               <th></th>
               <th></th>
               <th></th>
             </tr>
            </thead>
            <tbody>
              <tr v-for="result in results" :key="result.id">
                <!-- TODO: Build co-ordinates -->
                <td>{{ result.seed }}</td> 
               <td v-for="i in 6">
                  <span
                    v-if="result && result.traits && result.traits.length > i-1"
                    :class="getTraitConnotationClassById(result.traits[i-1])">{{ result.traits[i-1] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>

  </main>
</template>

<script>
import { DLCs, VanillaWorlds, SpacedOutWorlds, FrostyPlanetWorlds, WorldTraits } from '@/oni';
import Selectable from '@/components/Selectable.vue';

import oniGen from '../../../oniworldgen-js/dist/oniworldgen.mjs'

import worldGenJSON from '../../../oniworldgen-js/worldgen.json'

import Swal from 'sweetalert2';

// TODO: Watch the traits, and remove any mutual exclusions.

export default {
  name: 'MapExplorerView',
  data() {
    return {
      DLCs,
      selectedDLC: DLCs[0],
      form: {
        selectedWorld: null,
        worldTraits: [],

      },
      selectedTraits: [],

      isLoading: false,
      results: null,
    };
  },
  components: {
    Selectable,
  },
  computed: {
    selectedCluster() {
      console.log("selectedCluster", this.selectedDLC);
      if (!this.selectedDLC) {
        console.log('no selectedDLC');
        return null;
      }

      const id = this.selectedDLC.id;

      if (id === 'Vanilla') {
        return VanillaWorlds;
      } else if (id === 'Spaced Out!') {
        return SpacedOutWorlds;
      } else if (id == 'Frosty Planet') {
        return FrostyPlanetWorlds;
      } else {
        return null;
      }
    },
    neutralTraits() {
      return WorldTraits.filter((c) => c.connotation === 0);
    },
    neutralWorldTraits() {
      return this.selectedTraits.connotation === 0;
    },
    positiveTraits() {
      return WorldTraits.filter((c) => c.connotation === 1);
    },
    positiveWorldTraits() {
      return this.selectedTraits.connotation === 1;
    },
    negativeTraits() {
      return WorldTraits.filter((c) => c.connotation === -1);
    },
    negativeWorldTraits() {
      return this.selectedTraits.connotation === -1;
    },
  },
  mounted() {
    console.log("hi");
    // this.getSaveCount();
    // setInterval(this.getSaveCount, 2000);
    oniGen.SettingsCache.initData(worldGenJSON);

  },
  methods: {
    addCriteria() {
      this.form.criteria.push({});
    },
    removeCriteria(index) {
      this.form.criteria.splice(index, 1);
    },
    getTrait(id) {
      const trait = WorldTraits.find((c) => c.id === id);
      return trait
    },
    getConnotationClass(connotation) {
      if (connotation === 1) {
        return 'text-success';
      } else if (connotation === -1) {
        return 'text-danger';
      } else {
        return 'text-info';
      }
    },
    getTraitConnotationClassById(id) {
      const trait = this.getTrait(id);
      return this.getConnotationClass(trait.connotation);
    },

    generate() {
      let minSeedLength = 5;
      let maxSeedLength = 6;
      const wantedTraits = this.selectedTraits;

      // TODO: Add proper IDs to the clusters const so we can use them here.
      // Really we need to update oni.js to pull it from the clusters JSON 

      const clusterFile = "ForestStartCluster";
      const clusterInfo = oniGen.SettingsCache.getCluster(clusterFile);
      const worldPlacements = clusterInfo.worldPlacements;

      console.log("Generating", this.selectedTraits, " for ", clusterFile);

      let foundWorlds = [];
      let seedBase = 1824076888; // TODO: Pick a random number between minseedlength and maxseedlength
      let attempts = 1000;
      let wantedResults = 10;

      // TODO: Parallelise this, move to a server, loads of stuff we can do to make faster.
      for (let i = 0; i < attempts; i++) { 
        let seed = seedBase + i;

        let traitsFound = [];

        for (let j = 0; j < worldPlacements; j++) {
          const worldPlacement = worldPlacements[j];
          const worldName = worldPlacement.world.split('/')[1];

          console.log("Generating world: " + worldName 
            + " with seed: " + seed + j + " and index: " + j
          );

          let world = oniGen.SettingsCache.getWorld(worldName);        
          let traits = SettingsCache.getRandomTraits(seed + i, world);

          for (let trait of traits) {
            if (wantedTraits.includes(trait)) {
              traitsFound.push(trait);
            }
          }
        }
        
        // Lets check that all the traits are in the found traits array, there may be duplicates - this is ok
        // TODO: Another implementation may be to only check for worlds with all the traits, but this is a good start.

        if (wantedTraits.every(trait => traitsFound.includes(trait))) {
          foundWorlds.push({
            seed: seed,
            traits: traitsFound
          });
        }

        if (foundWorlds.length > wantedResults) {
          break;
        }
      }

      console.log("Found Worlds", foundWorlds);
      this.results = foundWorlds
    }
  },
  watch: {
    selectedDLC() {
      // this.cou
    },
  }
};

</script>
