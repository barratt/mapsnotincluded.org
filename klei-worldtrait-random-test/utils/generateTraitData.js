const yaml  = require('yaml');
const fs    = require('fs');

const gamePath = `C:\\Program Files (x86)\\Steam\\steamapps\\common\\OxygenNotIncluded`;

// This is an array as order matters,
const worldgenPaths = [
    { id: "vanilla", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\worldgen`, traitsPrefix: "traits/" },
    { id: "SpacedOut", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\dlc\\expansion1\\worldgen`, traitsPrefix: "expansion1::traits/"},
    { id: "FrostyPlanet", path: `${gamePath}\\OxygenNotIncluded_Data\\StreamingAssets\\dlc\\dlc2\\worldgen`, traitsPrefix: "dlc2::traits/"},
];


function compileYamlToJson() {
    let data = {};

    for (let worldgenPath of worldgenPaths) {
        const traitsPath = `${worldgenPath.path}\\traits`;
        data[worldgenPath.id] = { traits: {}};

        if (fs.existsSync(traitsPath)) {
            const files = fs.readdirSync(traitsPath);
            for (let file of files) {
                let trait = yaml.parse(fs.readFileSync(`${worldgenPath.path}\\traits\\${file}`, 'utf8'));
                data[worldgenPath.id].traits[worldgenPath.traitsPrefix + file.replace('.yaml', '')] = trait;
            }
        }

        const worldPath = `${worldgenPath.path}\\worlds`;
        data[worldgenPath.id].worlds = {};
        if (fs.existsSync(worldPath)) {
            const files = fs.readdirSync(worldPath);
            for (let file of files) {
                let world = yaml.parse(fs.readFileSync(`${worldgenPath.path}\\worlds\\${file}`, 'utf8'));
                data[worldgenPath.id].worlds[file.replace('.yaml', '')] = world;
            }
        }
    }

    fs.writeFileSync('compiledTraits.json', JSON.stringify(data, null, 4));
}

compileYamlToJson();