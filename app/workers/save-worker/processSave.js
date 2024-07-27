const fs = require('fs');
const oniSaveParser = require('oni-save-parser');

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
            
            const emissionRate = GeyserConfig.scaledRate; // I think? g/s?
            const eruptionPeriod = GeyserConfig.scaledYearLength; // Seconds?
            const dormancyPeriod = GeyserConfig.scaledIterationLength; // Seconds?


            processedSave.geysers.push(geyser);

        }
    }


    // Geysers are in game_objects, 

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