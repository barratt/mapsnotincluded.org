// TODO Implement actual test logic
const SettingsCache = require("../oni/SettingsCache.js");

SettingsCache.initData(require("../compiledTraits.json"));

let world = SettingsCache.getWorld("MediumRadioactiveVanillaWarpPlanet");

const assert = require("assert");

describe("WorldTrait", function () {
  describe("Generate World MediumRadioactiveVanillaWarpPlanet)", function () {
    it("101520169 + 1", function () {
        let seed = 101520169;
        let traits = SettingsCache.getRandomTraits(seed+1, world);
        assert.deepStrictEqual(traits, [ 'expansion1::traits/DistressSignal', 'traits/MagmaVents' ]);
    });

    it("2144513637 + 1", function () {
        let seed = 2144513637;
        let traits = SettingsCache.getRandomTraits(seed+1, world);
        assert.deepStrictEqual(traits, [ 'expansion1::traits/RadioactiveCrust', 'traits/BouldersMixed' ]);
    });
  });

  describe("SpacedOut - FRST-C-1824076888-0-D3-DH", function() {
    const seed = 1824076888;
    let clusterInfo = SettingsCache.getCluster("ForestStartCluster");

    let wordsToGenerate = clusterInfo.worldPlacements;

    let expectedTraits = [
        [ "traits/MisalignedStart", "traits/BouldersSmall", ],      // Folia
        [ "expansion1::traits/MetalCaves", "traits/Geodes" ],         // Irradiated Swampty
        [ "traits/DeepOil", ],                                      // Rusty Oil
        [ "expansion1::traits/DistressSignal", "traits/MetalRich", ],       // Tundra
        [],                                     // Marshy
        [],                                     // Moo
        [],                                     // Water
        ["traits/MetalRich"],                   // Superconductive
        [],                                     // Reoglith
    ]

    it("Should have 9 worldPlacements", function() {
        assert.strictEqual(wordsToGenerate.length, 9);
    });

    wordsToGenerate.forEach((worldPlacement, i) => {
        let worldName = worldPlacement.world.split('/')[1];
        // let index = worldPlacement.index;
        console.log("Generating world: " + worldName 
            + " with seed: " + seed + i + " and index: " + i
        );
        let world = SettingsCache.getWorld(worldName);
        let traits = SettingsCache.getRandomTraits(seed + i, world);
        let predictedTraits = expectedTraits[i];

        it(`${worldName} should have ${predictedTraits.join(',')}`, function() {
            assert.deepStrictEqual(traits, predictedTraits);
        });
    });
  });
});
