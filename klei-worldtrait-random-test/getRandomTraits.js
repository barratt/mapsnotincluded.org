const KRandom = require('./KRandom.js');

// worldTraitRules is an array of rules, each rule has the following properties:
// - specificTraits
// - requiredTags
// - forbiddenTags
// - forbiddenTraits
// - min
// - max


function isValidWorldTrait(trait, world, logErrors) {
    let num1 = 0; // No idea what these are for / tracking
    let num2 = 0;

    let globalFeatureMods = trait.globalFeatureMods || {};

    for (const [ key, value ] of Object.entries(globalFeatureMods)) {
        num1 += value;
        num2 += Math.floor(world.worldTraitScale * value);
    }

    if (Object.keys(globalFeatureMods).length === 0 || num2 !== 0) {
        return true;
    }

    if (logErrors) {
        console.warn(
            `Trait '${trait.filePath}' cannot be applied to world '${world.name}' due to globalFeatureMods and worldTraitScale resulting in no features being generated.`
        );
    }

    return false;
}


function getRandomTraits(seed, world, worldTraits) {
    if (world.disableWorldTraits || !world.worldTraitRules || seed === 0) {
        return [];
    }

    const kRandom = new KRandom(seed);
    const selectedTraits = [];
    const tagSet = new Set();

    world.worldTraitRules.forEach(rule => {
        if (rule.specificTraits) {
            rule.specificTraits.forEach(specificTrait => {
                if (worldTraits.hasOwnProperty(specificTrait)) {
                    selectedTraits.push(worldTraits[specificTrait]);
                } else {
                    console.error(`World trait ${specificTrait} doesn't exist, skipping.`);
                }
            });
        }

        let availableTraits = [...worldTraits];
        const requiredTags = rule.requiredTags ? new Set(rule.requiredTags) : null;
        const forbiddenTags = rule.forbiddenTags ? new Set(rule.forbiddenTags) : null;

        availableTraits = availableTraits.filter(trait => {     
            const containsRequiredTags = requiredTags ? trait.traitTags.containsAll(requiredTags) : true;
            const containsForbiddenTags = forbiddenTags ? trait.traitTags.find(x => x == forbiddenTags) : false;
            const forbiddenTraitsMatch = rule.forbiddenTraits && rule.forbiddenTraits.includes(trait.filePath);

            const isValid = isValidWorldTrait(trait, world, true);

            return containsRequiredTags && !containsForbiddenTags && !forbiddenTraitsMatch && isValid;
        });

        const num = kRandom.Next(rule.min, Math.max(rule.min, rule.max + 1));
        const initialCount = selectedTraits.length;

        while (selectedTraits.length < initialCount + num && availableTraits.length > 0) {
            const index = kRandom.Next(availableTraits.length);
            const worldTrait = availableTraits[index];
            let flag = false;

            worldTrait.exclusiveWith = worldTrait.exclusiveWith || [];
            worldTrait.exclusiveWithTags = worldTrait.exclusiveWithTags || [];

            if (worldTrait.exclusiveWith.length > 0) {
                console.log("It does work!")
            }
            
            // Check exclusiveWith
            worldTrait.exclusiveWith.forEach(exclusiveId => {
                if (selectedTraits.find(t => t.filePath === exclusiveId)) {
                    flag = true;
                }
            });

            // Check exclusiveWithTags
            worldTrait.exclusiveWithTags.forEach(exclusiveWithTag => {
                if (tagSet.has(exclusiveWithTag) > -1) {
                    flag = true;
                }
            });


            if (!flag) {
                selectedTraits.push(worldTrait);
                worldTraits.splice(index, 1);  // Remove from worldTraits
                worldTrait.exclusiveWithTags.forEach(exclusiveWithTag => {
                    tagSet.add(exclusiveWithTag);
                });
            }

            availableTraits.splice(index, 1);  // Remove from availableTraits
        }

        if (selectedTraits.length !== initialCount + num) {
            console.warn(`TraitRule on ${world.name} tried to generate ${num} but only generated ${selectedTraits.length - initialCount}`);
        }
    });

    return selectedTraits.map(item => item.name);
}

module.exports = getRandomTraits;