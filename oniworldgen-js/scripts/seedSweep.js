const SettingsCache = require("../oni/SettingsCache.js");
const traitsForSeed = require("./traitsForSeed.js");

SettingsCache.initData(require("../compiledTraits.json"));

function seedSweep(cluster, required, start, end) {
  const seeds = [...Array(end - start).keys()].map((i) => i + start);
  console.log(
    `Searching for seeds in cluster ${cluster} from ${start} to ${end}`,
    `that match required traits: `,
    required,
  );

  const found = seeds.filter((seed) => {
    const traits = traitsForSeed(cluster, seed);
    const allTraitsMatch = Object.entries(required).every(
      ([worldName, reqTraits]) => {
        const generatedTraits = traits.find((t) => t[worldName])?.[worldName] ||
          [];
        return reqTraits.every((trait) => generatedTraits.includes(trait));
      },
    );
    return allTraitsMatch;
  });

  found.forEach((seed) => {
    console.log(
      seed,
      // traitsForSeed(cluster, seed),
    );
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  seedSweep(args[0], JSON.parse(args[1]), parseInt(args[2]), parseInt(args[3]));
} else {
  module.exports = seedSweep;
}

// Example usage:
// node scripts/seedSweep.js PrehistoricSpacedOutCluster '{ "IdealLandingSite" : [ "traits/BouldersSmall", "expansion1::traits/MetalCaves" ] }' 25825134 25826135
// And then check for the detailed traits:
// node scripts/traitsForSeed.js PrehistoricSpacedOutCluster 25825658
