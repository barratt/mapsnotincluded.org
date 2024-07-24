const fs = require('fs');
const path = require('path');

let source = path.join(process.env.USERPROFILE, 'OneDrive', 'Documents', 'Klei', 'OxygenNotIncluded', 'save_files');
const destination = __dirname +  '/saves';


// NOTE: Saves are as follows:
//  source/<name>/<name>.sav

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination);
}

// Copy the saves
fs.readdir(source, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(file => {
    const sourceFile = `${source}/${file}/${file}.sav`;
    const destinationFile = `${destination}/${file}.sav`;

    if (fs.existsSync(destinationFile)) {
        console.log(`Skipping ${sourceFile} as it already exists in ${destination}`);
        return
    }

    fs.copyFile(sourceFile, destinationFile, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Copied ${sourceFile} to ${destinationFile}`);
    });
  });
});
