// Quick and dirty script to copy any new save files to here 

let savesDir = process.argv[2];
console.log(`Monitoring ${savesDir} for new save files`);

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let seenSaves = []

let existingSaves = fs.readdirSync("C:\\Users\\lecof\\OneDrive\\Documents\\Klei\\OxygenNotIncluded\\save_files");

for (let save of existingSaves) {
    // Lets copy it over if it doesn't exist
    console.log(`Checking if ${save} exists in ${savesDir}`);
    if (fs.existsSync(path.join(savesDir, save + '.sav'))) {
        console.log(`${save} already exists in ${savesDir}, skipping`);
    } else {
        console.log(`Copying ${save} to ${savesDir}`);
        fs.copyFile(path.join("C:\\Users\\lecof\\OneDrive\\Documents\\Klei\\OxygenNotIncluded\\save_files", save + "\\" +save + '.sav'), path.join(savesDir, save + '.sav'), (err) => {
            if (err) {
                console.error(`Error copying file: ${err}`);
            } else {
                console.log(`File copied successfully`);
            }
        });
    
    }
}


fs.watch(savesDir, {
    persistent: true,
    recursive: true,
}, (eventType, filename) => {
    // Check for any file that ends with .sav that has been added or renamed, but lets wait 10 seconds to make sure the file is done being written
    // console.log(`Event: ${eventType}, Filename: ${filename}`);
    if (filename && filename.endsWith('.sav') && (eventType === 'rename' || eventType === 'change')) {
        let saveName = filename.split('\\').pop();
        if (seenSaves.includes(saveName)) {
            console.log(`Already seen ${filename}, skipping`);
            return;
        }

        seenSaves.push(saveName);
        console.log(`Detected new save file: ${filename}`);


        setTimeout(() => {
            // let random = crypto.randomUUID();
            // The new format uses the seed name for both filename  LUSH-A-289679978-0-D3-0\LUSH-A-289679978-0-D3-0.sav

            let savePath = path.join(savesDir, filename);
            let newPath = path.join(__dirname, 'saves', saveName);
            console.log(`Copying ${savePath} to ${newPath}`);

            fs.copyFile(savePath, newPath, (err) => {
                if (err) {
                    console.error(`Error copying file: ${err}`);
                } else {
                    console.log(`File copied successfully`);
                }

                // Remove the file from the seenSaves array
                let index = seenSaves.indexOf(saveName);
                if (index > -1) {
                    console.log(`Removing ${saveName} from seenSaves`);
                    seenSaves.splice(index, 1);
                }
                
            });
        }, 3000);
    }

});