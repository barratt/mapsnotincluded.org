const KRandom = require('./KRandom.js');

// worldTraitRules is an array of rules, each rule has the following properties:
// - specificTraits
// - requiredTags
// - forbiddenTags
// - forbiddenTraits
// - min
// - max




function getRandomTraits(seed, world) {
    if (world.disableWorldTraits || !world.worldTraitRules || seed === 0) {
        return [];
    }

    const kRandom = new KRandom(seed);
    const list = Object.values(worldTraits);  // Assuming worldTraits is an object where values are WorldTrait objects
    const list2 = [];
    const tagSet = new TagSet();

    world.worldTraitRules.forEach(rule => {
        if (rule.specificTraits) {
            rule.specificTraits.forEach(specificTrait => {
                if (worldTraits.hasOwnProperty(specificTrait)) {
                    list2.push(worldTraits[specificTrait]);
                } else {
                    console.error(`World trait ${specificTrait} doesn't exist, skipping.`);
                }
            });
        }

        let list3 = [...list];
        const requiredTags = rule.requiredTags ? new TagSet(rule.requiredTags) : null;
        const forbiddenTags = rule.forbiddenTags ? new TagSet(rule.forbiddenTags) : null;

        list3 = list3.filter(trait => {     
            const containsRequiredTags = requiredTags ? trait.traitTagsSet.containsAll(requiredTags) : true;
            const containsForbiddenTags = forbiddenTags ? trait.traitTagsSet.containsOne(forbiddenTags) : false;
            const forbiddenTraitsMatch = rule.forbiddenTraits && rule.forbiddenTraits.includes(trait.filePath);
            return containsRequiredTags && !containsForbiddenTags && !forbiddenTraitsMatch && trait.isValid(world, true);
        });

        const num = kRandom.Next(rule.min, Math.max(rule.min, rule.max + 1));
        const initialCount = list2.length;

        while (list2.length < initialCount + num && list3.length > 0) {
            const index = kRandom.Next(list3.length);
            const worldTrait = list3[index];
            let flag = false;

            // Check exclusiveWith
            worldTrait.exclusiveWith.forEach(exclusiveId => {
                if (list2.find(t => t.filePath === exclusiveId)) {
                    flag = true;
                }
            });

            // Check exclusiveWithTags
            worldTrait.exclusiveWithTags.forEach(exclusiveWithTag => {
                if (tagSet.contains(exclusiveWithTag)) {
                    flag = true;
                }
            });

            if (!flag) {
                list2.push(worldTrait);
                list.splice(index, 1);  // Remove from list
                worldTrait.exclusiveWithTags.forEach(exclusiveWithTag => {
                    tagSet.add(exclusiveWithTag);
                });
            }

            list3.splice(index, 1);  // Remove from list3
        }

        if (list2.length !== initialCount + num) {
            console.warn(`TraitRule on ${world.name} tried to generate ${num} but only generated ${list2.length - initialCount}`);
        }
    });

    return list2.map(item => item.filePath);
}

module.exports = getRandomTraits;