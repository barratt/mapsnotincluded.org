// Quick and dirty script to copy any new save files to here 

let savesDir = process.argv[2];
console.log(`Monitoring ${savesDir} for new save files`);

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let seenSaves = []

fs.watch(savesDir, {
    persistent: true,
    recursive: true,
}, (eventType, filename) => {
    // Check for any file that ends with .sav that has been added or renamed, but lets wait 10 seconds to make sure the file is done being written
    // console.log(`Event: ${eventType}, Filename: ${filename}`);
    if (filename && filename.endsWith('.sav') && (eventType === 'rename' || eventType === 'change')) {
        if (seenSaves.includes(filename)) {
            console.log(`Already seen ${filename}, skipping`);
            return;
        }

        seenSaves.push(filename);
        console.log(`Detected new save file: ${filename}`);


        setTimeout(() => {
            let random = crypto.randomUUID();
            let savePath = path.join(savesDir, filename);
            let newPath = path.join(__dirname, 'saves', `${random}.sav`);
            console.log(`Copying ${savePath} to ${newPath}`);
            fs.copyFile(savePath, newPath, (err) => {
                if (err) {
                    console.error(`Error copying file: ${err}`);
                } else {
                    console.log(`File copied successfully`);
                }

                // Remove the file from the seenSaves array
                let index = seenSaves.indexOf(filename);
                if (index > -1) {
                    seenSaves.splice(index, 1);
                }
                
            });
        }, 3000);
    }

});