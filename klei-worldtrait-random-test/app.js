const yaml = require('yaml');
const fs = require('fs');

const getRandomTraits = require('./getRandomTraits.js');
const worlds = require('./worlds.json'); // This is just a dump from the releases page.

const gamePath = `C:\\Program Files (x86)\\Steam\\steamapps\\common\\OxygenNotIncluded`;

// This is an array as order matters,
const worldgenPaths = [
    { id: "vanilla", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\worldgen`, },
    { id: "SpacedOut", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\dlc\\expansion1\\worldgen`, },
    { id: "FrostyPlanet", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\dlc\\dlc2\\worldgen`, },
];

for (let world of worlds) {
    let coordinate = world.coordinate; // coordinate V-SNDST-C-101520169-0-0-0
    // Seed would be 101520169
    // On DLC enabled games, there is a V- prefix,lets remove this prefix
    coordinate = coordinate.replace('V-', '');
    const seed = parseInt(coordinate.split('-')[2]);

    let allTraits = [];
    for (let i in world.asteroids) {
        const asteroid      = world.asteroids[i];
        const worldTraits   = asteroid.worldTraits;

        let worldTraitDefinition = {};
        let availableWorldTraits = [];

        for (let worldgenPath of worldgenPaths) {
            if (world.dlcs.includes(worldgenPath.id)) {
                const definitionPath = `${worldgenPath.path}\\worlds\\${asteroid.id}.yaml`;
                if (fs.existsSync(definitionPath)) {
                    worldTraitDefinition = { ...worldTraitDefinition, ...yaml.parse(fs.readFileSync(definitionPath, 'utf8')) };
                } else {
                    // Log?
                }

                // Load in all the traits if the folder exists
                const traitsPath = `${worldgenPath.path}\\traits`;
                if (fs.existsSync(traitsPath)) {
                    const files = fs.readdirSync(traitsPath);
                    for (let file of files) {
                        let trait = yaml.parse(fs.readFileSync(`${worldgenPath.path}\\traits\\${file}`, 'utf8'));
                        availableWorldTraits.push(trait);
                    }
                } else {
                    // Log?
                }
            }
        }

         console.log(`Seed: ${seed}, asteroid ${asteroid.id} (${world.dlcs.join(', ')}) has ${worldTraits.join(', ')} traits`);
        
        console.log("Attempting to predict traits");

        // Now we can generate the world
        const generatedTraits = getRandomTraits(seed + i, worldTraitDefinition, availableWorldTraits);
        console.log(`Generated ${generatedTraits.length} traits: ${generatedTraits.join(', ')}`);

        // Now we can compare the two arrays
        const missingTraits = allTraits.filter(t => !generatedTraits.includes(t));
        const extraTraits = generatedTraits.filter(t => !allTraits.includes(t));

        console.log(`Missing traits: ${missingTraits.join(', ')}`);
        console.log(`Extra traits: ${extraTraits.join(', ')}`);
    }


    break;
}