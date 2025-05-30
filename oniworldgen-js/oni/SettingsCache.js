// InitData
// GetWorld
// GetRandomTraits

const KRandom = require('./KRandom');
const TagSet = require('./TagSet');
const WorldTrait = require('./WorldTrait');
const Tag = require("./Tag");

const SettingsCache = {
  IsInSpacedOutMode: true,
  SpacedOutId: 'EXPANSION1_ID',
  BaseGameId: '',
  worldTraits: {},
  worlds: {},
  clusters: {},



  initData(data) {
    // Populate worlds and traits from vanilla
    for (const [key, world] of Object.entries(data.vanilla.worlds)) {
      this.worlds[key] = { ...world, id: key };
    }

    for (const [key, trait] of Object.entries(data.vanilla.traits)) {
      if (trait.forbiddenDLCIds && trait.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId)) {
        continue;
      }
      this.worldTraits[key] = { ...trait, filePath: key };
    }

    for (const [key, cluster] of Object.entries(data.vanilla.clusters)) {
      this.clusters[key] = { ...cluster, id: key };
    }

    // Populate worlds and traits for SpacedOut
    if (this.IsInSpacedOutMode) {
      for (const [key, world] of Object.entries(data.SpacedOut.worlds)) {
        this.worlds[key] = { ...world, id: key };
      }

      for (const [key, trait] of Object.entries(data.SpacedOut.traits)) {
        if (trait.forbiddenDLCIds && trait.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId)) {
          continue;
        }
        this.worldTraits[key] = { ...trait, filePath: key };
      }

      for (const [key, cluster] of Object.entries(data.SpacedOut.clusters)) {
        this.clusters[key] = { ...cluster, id: key };
      }

    }



    // Populate worlds and traits for FrostyPlanet
    for (const [key, world] of Object.entries(data.FrostyPlanet.worlds)) {
      this.worlds[key] = { ...world, id: key };
    }

    for (const [key, trait] of Object.entries(data.FrostyPlanet.traits)) {
      if (trait.forbiddenDLCIds.includes(this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId)) {
        continue;
      }
      this.worldTraits[key] = { ...trait, filePath: key };
    }

    for (const [key, cluster] of Object.entries(data.FrostyPlanet.clusters)) {
      this.clusters[key] = { ...cluster, id: key };
    }

    // Populate worlds and traits for Prehistoric
    for (const [key, world] of Object.entries(data.Prehistoric.worlds)) {
      this.worlds[key] = { ...world, id: key };
    }

    for (const [key, trait] of Object.entries(data.Prehistoric.traits)) {
      if (
        trait.forbiddenDLCIds.includes(
          this.IsInSpacedOutMode ? this.SpacedOutId : this.BaseGameId,
        )
      ) {
        continue;
      }
      this.worldTraits[key] = { ...trait, filePath: key };
    }

    for (const [key, cluster] of Object.entries(data.Prehistoric.clusters)) {
      this.clusters[key] = { ...cluster, id: key };
    }

    console.log(
      `Worlds initialized, ${Object.keys(this.worlds).length} entries`,
    );
    console.log(
      `Traits initialized, ${Object.keys(this.worldTraits).length} entries`,
    );
    console.log(
      `Clusters initialized, ${Object.keys(this.clusters).length} entries`,
    );
  },

  getRandomWorld() {
    const worldList = Object.values(this.worlds);
    return worldList[Math.floor(Math.random() * worldList.length)];
  },

  getWorld(key) {
    return this.worlds[key];
  },

  getCluster(key) {
    return this.clusters[key];
  },

  getRandomTraits(seed, world) {
    if (!world) {
      throw new Error('World is required');
    }
    
    if (world.disableWorldTraits) {
      console.log('Traits disabled');
      return [];
    }

    if (!world.worldTraitRules) {
      console.log('no rules');
      return [];
    }

    if (seed === 0) {
      console.log('seed is 0');
      return [];
    }

    const kRandom     = new KRandom(seed);
    const traitList   = [...(Object.values(this.worldTraits).map(trait => new WorldTrait(trait)))]; // Turn them into WorldTrait objects
    const selectedTraits = [];
    const tagSet  = new TagSet();

    for (const rule of world.worldTraitRules) {
      // Specific traits
      if (rule.specificTraits) {
        for (const specificTrait of rule.specificTraits) {
          if (this.worldTraits[specificTrait]) {
            selectedTraits.push(this.worldTraits[specificTrait]);
          } else {
            console.log(`World traits ${specificTrait} doesn't exist, skipping.`);
          }
        }
      }

      let availableTraits = [...traitList];

      const requiredTags = rule.requiredTags ? new TagSet(rule.requiredTags) : null;
      const forbiddenTags = rule.forbiddenTags ? new TagSet(rule.forbiddenTags) : null;
      
      availableTraits = availableTraits.filter(trait => {
        // let worldTrait = new WorldTrait(trait);

        const validRequiredTags = !requiredTags || trait.TraitTagsSet.containsAll(requiredTags);
        const validForbiddenTags = !forbiddenTags || !trait.TraitTagsSet.containsOne(forbiddenTags);
        const validForbiddenTraits = !rule.forbiddenTraits || !rule.forbiddenTraits.includes(trait.filePath);

        return validRequiredTags && validForbiddenTags && validForbiddenTraits && trait.isValid(world, true);
      });

      const traitsToGenerate = kRandom.next(rule.min, Math.max(rule.min, rule.max + 1));
      const initialSelectedTraitsCount = selectedTraits.length;

      while (selectedTraits.length < initialSelectedTraitsCount + traitsToGenerate && availableTraits.length > 0) {
        const index = kRandom.next(availableTraits.length);
        const worldTrait = availableTraits[index];

        let isExclusive = false;

        if (!worldTrait) {
          console.log(`Uh oh`);
          continue;
        }

        for (const exclusiveId of worldTrait.exclusiveWith) {
          if (selectedTraits.find(t => t.filePath === exclusiveId)) {
            isExclusive = true;
            break;
          }
        }

        for (const exclusiveWithTag of worldTrait.exclusiveWithTags) {
          if (tagSet.contains(exclusiveWithTag)) {
            isExclusive = true;
            break;
          }
        }

        if (!isExclusive) {
          selectedTraits.push(worldTrait);
          availableTraits.splice(index, 1);
          traitList.splice(traitList.indexOf(worldTrait), 1);

          for (const tag of worldTrait.exclusiveWithTags) {
            tagSet.add(new Tag(tag));
          }
        }
      }

      if (selectedTraits.length !== initialSelectedTraitsCount + traitsToGenerate) {
        console.log(`TraitRule on ${world.name} tried to generate ${traitsToGenerate} but only generated ${selectedTraits.length - initialSelectedTraitsCount}`);
      }
    }

    return selectedTraits.map(t => t.filePath)
  }
};

module.exports = SettingsCache;
