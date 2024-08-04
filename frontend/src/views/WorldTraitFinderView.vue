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
    <div class="d-flex gap-5 justify-content-center flex-wrap mt-5" v-if="selectedCluster">
      <Selectable :items="selectedCluster" v-model="form.selectedWorld"  />
    </div>

    <!-- TODO: Some way of turning on the good and the bad traits. -->

    <hr/>
    <div class="row text-center mt-5">
      <div class="col-12 col-md-4">
        <span class="text-danger">{{ negativeWorldTraits.length }} Negative Traits</span>

        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="negativeTraits" v-model="negativeWorldTraits" :multiselect="true" selected-text-class="text-danger"/>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <span class="">{{ neutralWorldTraits.length }} Neutral Traits</span>
        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="neutralTraits" v-model="neutralWorldTraits" :multiselect="true" selected-text-class="text-info"/>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <span class="text-success">{{ positiveWorldTraits.length }} Positive Traits</span>
        <div class="d-flex gap-5 justify-content-center flex-wrap mt-4">
          <Selectable :items="positiveTraits" v-model="positiveWorldTraits" :multiselect="true" selected-text-class="text-success"/>
        </div>
      </div>


    </div>

    <hr/>

    <div class="d-flex justify-content-center mt-3">
      <button v-if="!isLoading" class="btn btn-success" @click="search"><i class="bi-search me-2"></i>Search</button>
      <button v-else class="btn btn-success" disabled><i class="bi-search me-2"></i>Searching...</button>
    </div>

  </main>
</template>

<script>
import { DLCs, VanillaWorlds, SpacedOutWorlds, FrostyPlanetWorlds, WorldTraits } from '@/oni';
import Selectable from '@/components/Selectable.vue';
const API_URL = import.meta.env.VITE_API_URL;

// TODO: Watch the traits, and remove any mutual exclusions.

export default {
  name: 'MapExplorerView',
  data() {
    return {
      DLCs,
      saveCount: 0,
      form: {
        selectedWorld: null,
        selectedDLC: DLCs[0],
        worldTraits: [],

      },
      negativeWorldTraits: [],
      neutralWorldTraits: [],
      positiveWorldTraits: [],

      isLoading: false,
      results: null,
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
    },
    neutralTraits() {
      return WorldTraits.filter((c) => c.connotation === 0);
    },
    positiveTraits() {
      return WorldTraits.filter((c) => c.connotation === 1);
    },
    negativeTraits() {
      return WorldTraits.filter((c) => c.connotation === -1);
    }
  },
  mounted() {
    // this.getSaveCount();
    // setInterval(this.getSaveCount, 2000);
  },
  methods: {
    addCriteria() {
      this.form.criteria.push({});
    },
    removeCriteria(index) {
      this.form.criteria.splice(index, 1);
    },

    // getSaveCount() {
    //   console.log('getCount');
    //   const url = `${API_URL}/saves/count`;
    //   console.log('url', url);
    //   // worldId is a query parameter.
    //   fetch(url)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       console.log('data', data);
    //       this.saveCount = data.count;
    //     });
    // }

    search() {
      this.isLoading = true;
      try {
        console.log('search', this.form);
        const url = `${API_URL}/saves/search`;

        let worldTraits = this.negativeWorldTraits.concat(this.neutralWorldTraits).concat(this.positiveWorldTraits);

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.form,
            worldTraits,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('data', data);
            this.results = data;
            this.isLoading = false;
          });
        
      } catch (e){
        this.isLoading = false;
      } 
    }
  }
};


</script>
