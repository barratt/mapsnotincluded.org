class TraitRule {
    constructor(min = 0, max = 0) {
        this.min = min;
        this.max = max;
        this.requiredTags = null;
        this.specificTraits = null;
        this.forbiddenTags = null;
        this.forbiddenTraits = null;
    }

    // Setters for lists if needed (or use array methods directly)
    setRequiredTags(tags) {
        this.requiredTags = tags;
    }

    setSpecificTraits(traits) {
        this.specificTraits = traits;
    }

    setForbiddenTags(tags) {
        this.forbiddenTags = tags;
    }

    setForbiddenTraits(traits) {
        this.forbiddenTraits = traits;
    }

    validate() {
        if (this.specificTraits) {
            console.assert(
                !this.requiredTags,
                "TraitRule using specificTraits does not support requiredTags"
            );
            console.assert(
                !this.forbiddenTags,
                "TraitRule using specificTraits does not support forbiddenTags"
            );
            console.assert(
                !this.forbiddenTraits,
                "TraitRule using specificTraits does not support forbiddenTraits"
            );
        }
    }
}

module.exports = TraitRule;