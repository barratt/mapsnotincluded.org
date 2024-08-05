<script setup>

</script>

<template>
  <main>
    <div class="mb-5">
      <h1>Trait Finder</h1>
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

    <div v-if="results" class="mt-5">
      <hr />
      <h2>{{ results.totalResults}} Results</h2>
      <div class="row">
        <div class="col-12">
          <table class="table">
            <thead>
              <tr>
                <th>World</th>
                <th>Traits</th> <!-- Trait 1 -->
                <th></th><!-- Trait 1 -->
                <th></th><!-- Trait 1 -->
                <th></th><!-- Trait 1 -->
                <th></th><!-- Trait 1 -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="save in results.saves" :key="save.id">
                <td>{{ save.coordinates }}</td>
                <!-- This is a bit awkward, but we want to use a table, and we want the cols/rows to line up -->
                <td v-for="i in 5">
                  <span
                    v-if="save.worldTraits.length > i"
                    :class="getTraitConnotationClassById(save.worldTraits[i])">{{ save.worldTraits[i] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- <- page 1 of max ->> -->
      <div class="d-flex justify-content-center">
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item"><button class="page-link" @click="paginate('prev')">Previous</button></li>
            <li class="page-item" v-if="results.page > 0"><button class="page-link" @click="paginate(1)">1</button></li>
            <li class="page-item" v-if="results.page > 2"><button class="page-link" @click="paginate(results.page - 2)">{{ results.page - 2 + 1 }}</button></li>
            <li class="page-item" v-if="results.page > 1"><button class="page-link" @click="paginate(results.page - 1)">{{ results.page - 1 + 1}}</button></li>
            <li class="page-item disabled" ><button class="page-link">{{ results.page + 1 }}</button></li>
            <li class="page-item" v-if="results.totalPages > results.page + 1"><button class="page-link" @click="paginate(results.page + 1)">{{ results.page + 1 + 1 }}</button></li>
            <li class="page-item" v-if="results.totalPages > results.page + 2"><button class="page-link" @click="paginate(results.page + 2)">{{ results.page + 2 + 1 }}</button></li>
            <li class="page-item"><button class="page-link" @click="paginate(results.totalPages-1)">{{ results.totalPages }}</button></li>
            <li class="page-item"><button class="page-link" @click="paginate('next')">Next</button></li>
          </ul>
        </nav>
      </div>

    </div>

  </main>
</template>

<script>
import { DLCs, VanillaWorlds, SpacedOutWorlds, FrostyPlanetWorlds, WorldTraits } from '@/oni';
import Selectable from '@/components/Selectable.vue';
const API_URL = import.meta.env.VITE_API_URL;

import Swal from 'sweetalert2';

// TODO: Watch the traits, and remove any mutual exclusions.

export default {
  name: 'MapExplorerView',
  data() {
    return {
      DLCs,
      saveCount: 0,
      page: 0,
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
    paginate(page) {
      console.log('paginate', page);
      
      this.isLoading = true;
      
      if (page === 'prev') {
        page = this.results.page - 1;
      } else if (page === 'next') {
        page = this.results.page + 1;
      }

      this.page = page;
      
      this.search();
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
        worldTraits = worldTraits.map((c) => c.id);

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.form,
            worldTraits,
            page: this.page,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('data', data);
            this.results = data;
            this.isLoading = false;
          })
          .catch((e) => {
            console.error(e)
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
            })
          });
        
      } catch (e){
        this.isLoading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        })
      } 
    }
  }
};


</script>
