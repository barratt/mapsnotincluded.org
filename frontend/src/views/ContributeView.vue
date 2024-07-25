<script setup>

</script>

<template>
  <main>
    <div class="mb-5">
      <h1>Contribute</h1>
    </div>
    
    <div class="mb-5">
      <h2 class="text-success">Developers</h2>
      <p>
        This project is open source and contributions are welcome. If you have a feature request or found a bug, please open an issue on the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request. You can find us at <a href="https://github.com/barratt/mapsnotincluded.org" target="mni_disc">GitHub</a>.
      </p>
    </div>
    
    <div class="mb-5">
      <h2 class="text-info">Gamers</h2>
      <p>
        We're looking for cool saves that we can index so other players can enjoy them, please share with us your worlds over on our <a href="https://discord.gg/3vhCpp6PNq" target="mni_gh">Discord</a>. Eventually this will be replaced with a nice automated upload process.
      </p>

      <p>
        Additionally we're looking for feedback on the site, if you have any suggestions or found a bug, please come and share your thoughts.
      </p>

      <p>
        And finally, if you know anything about the world generation process in Oxygen Not Included, we would love to hear from you. We're always looking to improve our understanding of the game and the tools we build around it. Even if its some cool ideas on the seed-format
      </p>
    </div>

    <div class="mb-5">
      <h2 class="text-warning">Artists</h2>
      <p>
        We're looking for some graphics for the site, if you have any ideas or would like to contribute, please get in touch.
      </p>
    </div>

    <div class="mb-5">
      <h2 class="text-danger">Donations</h2>
      <p>
        We're not looking for donations at this time, but if you would like to support the project, please consider contributing to the <a href="https://oxygennotincluded.com/" target="mni_oni">Oxygen Not Included</a> developers. In the future we may look at hosting costs and other expenses, but for now we're just happy to be here.
      </p>
    </div>  

    <div class="mb-5">
      <h2>Contributors</h2>

      <p>
        Huge thank you to the following people who have contributed to the project, either directly or indirectly (through works that have aided the ideas or development of the project).
      </p>
      <ul>
        <li><a href="https://github.com/RoboPhred/oni-save-parser#readme">RoboPhred</a> - Thank you for your contributions to parsing and understanding ONI saves</li>
        <li><a href="https://stefan-oltmann.de/">Stefan Oltmann</a> - Thank you for the web interface to parse ONI saves that was made fully open source</li>
        <li><a href="https://github.com/Cairath">Cairath</a> - Thank you for giving the community such a wonderful tool for years and years with no expectation of payment. We hope one day to collaborate directly together! Also thank you for your administration of the Discord server and for the guides written for modding ONI!</li>
        <li><a href="https://github.com/pardeike">@paradeike</a> creator of <a href="https://github.com/pardeike/Harmony">Harmony</a>, the library that made modding ONI possible.</li>
        <li><a href="https://www.youtube.com/@Magnet_MD">@Magnet_MD</a> For the inspiration for this project, I (LeCoffee) personally would have never discovered the importance of seed finding without watching content creators such as Magnet</li>
        <li><a href="https://kleientertainment.com/">Klei Entertainment</a> - Thank you for creating such a wonderful game and for the community you have fostered around it</li>
      </ul>
    </div>
    
    <div class="mb-5">
      <h2>Contact Direct</h2>
      <p>
        If you would like to contact us directly and more formally, please email us at <a href="mailto:hello@mapsnotincluded.org">hello@mapsnotincluded.org</a>
      </p>
    </div>
  </main>
</template>

<script>
import { DLCs, VanillaWorlds, SpacedOutWorlds, FrostyPlanetWorlds } from '@/oni';
import Selectable from '@/components/Selectable.vue';

export default {
  name: 'MapExplorerView',
  setup() {
    return {
      DLCs,
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
  methods: {
    addCriteria() {
      this.form.criteria.push({});
    },
    removeCriteria(index) {
      this.form.criteria.splice(index, 1);
    }
  }
};


</script>
