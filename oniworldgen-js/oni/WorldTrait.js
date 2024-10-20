const TagSet = require('./TagSet');

class WorldTrait {
    constructor(trait) {
        // Initializing properties with values from the trait parameter
        this.name = trait.name || '';
        this.description = trait.description || '';
        this.colorHex = trait.colorHex || '';
        this.icon = trait.icon || '';
        this.forbiddenDLCIds = trait.forbiddenDLCIds || [];
        this.exclusiveWith = trait.exclusiveWith || [];
        this.exclusiveWithTags = trait.exclusiveWithTags || [];
        this.traitTags = trait.traitTags || [];
        this.globalFeatureMods = trait.globalFeatureMods || {}; // Dictionary equivalent
        this.removeWorldTemplateRulesById = trait.removeWorldTemplateRulesById || [];
        this.elementBandModifiers = trait.elementBandModifiers || [];
        this.filePath = trait.filePath || '';
        
        // Initialize traitTagsSet later when needed
        this.traitTagsSet = null; 
    }

    // Getter for TraitTagsSet
    get TraitTagsSet() {
        if (this.traitTagsSet === null) {
            this.traitTagsSet = new TagSet(this.traitTags);
        }
        return this.traitTagsSet;
    }

    // Method to validate WorldTrait
    isValid(world, logErrors = false) {
        let totalValue = 0;
        let scaledValue = 0;

        for (const featureMod in this.globalFeatureMods) {
            totalValue += this.globalFeatureMods[featureMod];
            scaledValue += Math.floor(world.worldTraitScale * this.globalFeatureMods[featureMod]);
        }

        if (Object.keys(this.globalFeatureMods).length <= 0 || scaledValue !== 0) {
            return true;
        }

        // Optionally log errors if needed
        if (logErrors) {
            console.warn(`Trait '${this.filePath}' cannot be applied to world '${world.name}' due to globalFeatureMods and worldTraitScale resulting in no features being generated.`);
        }

        return false;
    }
}

module.exports = WorldTrait;
