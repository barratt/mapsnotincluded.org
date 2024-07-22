const fs = require("fs");
const {
    parseSaveGame,
    writeSaveGame,
    AIAttributeLevelsBehavior
} = require("oni-save-parser");


function loadFile(path) {
    const fileData = fs.readFileSync(path);
    return parseSaveGame(fileData.buffer);
}

  
async function main() {
    const savePath = process.argv[2];

    const saveData = loadFile(savePath);

    console.log(saveData);

    fs.writeFileSync('output.json', JSON.stringify(saveData, null, 2));

    console.log('Done');
}


main();