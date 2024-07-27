const fs = require('fs');
const oniSaveParser = require('oni-save-parser');
const KRandom = require('./KRandom');

async function processSave(saveBuffer){
    const save = oniSaveParser.parseSaveGame(saveBuffer);

    const processedSave = {
        gameVersion: save.version.major + '.' + save.version.minor,
        modded: save.world.active_mods.length > 0,
        mods: save.world.active_mods,
        seed: save.gameData.worldDetail.globalWorldSeed, // Note: This is just the numbers
        // coordinates: save.world.worldgen.starting_base_location, // Not sure how we calculate this, doesn't seem to be in the save
        cycle: save.header.gameInfo.numberOfCycles,
        duplicants: save.header.gameInfo.numberOfDuplicants,
        dlc: save.header.gameInfo.dlcId,
        baseName: save.header.gameInfo.baseName,

        biomes: [],
        geysers: [],
        resources: [],
        buildings: [],
        critters: [],
        worldTraits: []
    };
    
    const rawGeysersParent = save.gameObjects.filter(x => x.name.indexOf('Geyser') > -1);
    
    // MakeConfiguration is called which calls CreateRandomInstance with presets per geyser.
    // Then on spawned creates a KRandom based on world seed + x + y.
    // This is then used to generate a roll. So to calculate this we would need to implement the KRandom class and the presets. we know the seed and x y 
    

    for (let parent of rawGeysersParent) {
        const geyserType = parent.name;

        for (let rawGeyser of parent.gameObjects) {

            const geyser = {
                type: geyserType,
                position: rawGeyser.position,
            };

            // Lets get the temperature and the eruption period and dormancy period
            const PrimaryElement = rawGeyser.behaviors.find(x => x.name === 'PrimaryElement');
            geyser.temperature = PrimaryElement.templateData._Temperature;

            const Configurator = rawGeyser.behaviors.find(x => x.name === 'GeyserConfigurator'); // In the actual game, this is what gets the durations, but it appears empty here.
            
            const Geyser = rawGeyser.behaviors.find(x => x.name === 'Geyser'); // This is where the durations are stored in the save file
            const GeyserConfig = Geyser.templateData.configuration;
            
            // Eruption Period: xxxs every scaledIterationLength
            // Next Dormancy: xxx (yearLengthRoll) ?
            // Active Period: xx cycles every xxx cycles (scaledYearLength(s))

            // When modifying the rateRoll to 1, the Natural Gas (g/s) changes to 578.2 (0.24 = 406.1) so clearly this is calculated in some way. No idea if this is different based on type.
            // I think we should store the relative values, as then we can 'look for the best' rolls. and if the calculation changes so can we

            const emissionRate = GeyserConfig.scaledRate; // I think? g/s?
            const activePeriod = GeyserConfig.scaledYearLength; // Seconds?
            const dormancyPeriod = GeyserConfig.scaledIterationLength; // Seconds?


            const randomInstance = new KRandom(save.gameData.worldDetail.globalWorldSeed + rawGeyser.position.x + rawGeyser.position.y);
            
            // randomInstance.rateRoll = this.Roll(randomSource, min, max);
            // randomInstance.iterationLengthRoll = this.Roll(randomSource, 0.0f, 1f);
            // randomInstance.iterationPercentRoll = this.Roll(randomSource, min, max);
            // randomInstance.yearLengthRoll = this.Roll(randomSource, 0.0f, 1f);
            // randomInstance.yearPercentRoll = this.Roll(randomSource, min, max);
            // This isn't working nicely, perhaps we just need to make the mod gather this data :(
            const rateRoll = randomInstance.Next(0, 100);
            const iterationLengthRoll = randomInstance.NextDouble(0, 1);


            processedSave.geysers.push(geyser);

        }
    }


    // Geysers are in game_objects, 
    // When debugging, sometimes modifying values and loading the game can help to see whats changed, so lets save the save
    let newBuffer = oniSaveParser.writeSaveGame(save);
    fs.writeFileSync('output.sav', Buffer.from(newBuffer));

    return processedSave
}

module.exports = processSave;

// Directly call processSave (mainly for development)
if (require.main === module) {
    const savePath = process.argv[2];
    const saveBuffer = fs.readFileSync(savePath).buffer;
    processSave(saveBuffer).then(data => {
        console.log(data);
        fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
    });
}