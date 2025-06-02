const SettingsCache = require("../oni/SettingsCache.js");

SettingsCache.initData(require("../compiledTraits.json"));

function traitsForSeed(cluster, seed) {
  let clusterInfo = SettingsCache.getCluster(cluster);
  let worldsToGenerate = clusterInfo.worldPlacements;
  return worldsToGenerate.map((worldPlacement, i) => {
    let worldName = worldPlacement.world.split("/")[1];
    let world = SettingsCache.getWorld(worldName);
    let traits = [];
    if (!world.disableWorldTraits) {
      traits = SettingsCache.getRandomTraits(seed + i, world);
    }
    return { [worldName]: traits };
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const traits = traitsForSeed(args[0], parseInt(args[1]));
  console.log(traits);
} else {
  module.exports = traitsForSeed;
}
// Example usage:
// node scripts/traitsForSeed.js PrehistoricSpacedOutCluster 25825658
