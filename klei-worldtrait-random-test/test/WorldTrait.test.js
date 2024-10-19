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
});
