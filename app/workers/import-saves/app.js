require('dotenv').config();

const fs = require('fs');
const { File, Save, Geyser } = require('../../models'); 
const oniParser = require('oni-save-parser');

const s3 = require('../../lib/s3');
const { HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

let worldTraits = [];
let geysers = [];

async function main(savesDir) {
    const saves = fs.readdirSync(savesDir);

    console.log(`Processing ${saves.length} saves`);

    for (const save of saves) {
        if (save == 'auto_save') continue;

        let jsonFilePath = `${savesDir}/${save}/${save}.sav.json`
        console.log(`Processing ${save}`);

        if (!fs.existsSync(jsonFilePath)) {
            console.log(`Save ${save} does not have a json file, skipping`);
            continue;
        }

        if (!fs.existsSync(`${savesDir}/${save}/${save}.sav`)) {
            console.log(`Save ${save} does not have a save file, skipping`);
            continue;
        }
        

        for (let trait of JSON.parse(fs.readFileSync(jsonFilePath)).worldTraits) {
            if (!worldTraits.includes(trait)) {
                worldTraits.push(trait);
            }
        }

        for (let geyser of JSON.parse(fs.readFileSync(jsonFilePath)).geysers) {
            if (!geysers.includes(geyser.Element)) {
                geysers.push(geyser.Element);
            }
        }

        // continue;

        // Process save

        // Create a save record, or get the one that exists,
        // If exists skip

        // Create a file record, link to save

        // Create geyser records, link to save

        // Save the save record

        let saveRecord = await Save.findOne({
            where: {
                coordinates: save
            }
        });

        if (saveRecord) {
            console.log(`Save ${save} already exists, skipping`);
            continue;
        }

        // console.log(`Processing save ${save}`);

        const fileData = fs.readFileSync(`${savesDir}/${save}/${save}.sav`);
        const saveParsed = oniParser.parseSaveGame(fileData.buffer);
        const jsonSave   = JSON.parse(fs.readFileSync(`${savesDir}/${save}/${save}.sav.json`), null, 2);
        const dlc = saveParsed.header.gameInfo.dlcId;

        if (dlc !== null) {
            console.log(`Save ${save} is not vanilla (Got ${dlc}), skipping`);
            continue;
        }

        const fileKey = `${save}.sav`;
        const fileStream = fs.createReadStream(`${savesDir}/${save}/${save}.sav`);
        
        // Upload to S3 if not exits
        try {
            console.log("Checking if file exists");
            let existsResp = await s3.send(new HeadObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: fileKey
            }));

            console.log(`File ${fileKey} already exists, skipping`);
        } catch (error) {
            console.log(`Uploading file ${fileKey}`);
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: fileKey,
                Body: fileStream
            }));
        }
        
        let fileRecord = await File.findOne({
            where: {
                s3Key: fileKey,
            }
        });

        if (!fileRecord) {
            console.log(`Creating file record for ${fileKey}`);
            fileRecord = await File.create({
                filename: save + '.sav',
                bucket: process.env.S3_BUCKET,
                s3Key: fileKey,
                size: fileData.byteLength,
            });
        }
        
        console.log(`Creating save record for ${save}`);
        saveRecord = await Save.create({ // TODO: Add to the mod all of this data so we don't have to rely on the save parser project and the mod project.
            seed: saveParsed.gameData.worldDetail.globalWorldSeed,
            coordinates: save,
            gameVersion: saveParsed.version.major + '.' + saveParsed.version.minor,
            worldId: '0',
            // For now we are only doing vanilla
            vanilla: true,
            spacedOut: false,
            frostyPlanet: false,
            wordTraits: jsonSave.worldTraits.map(x => x.replace('traits/', '')),
            fileId: fileRecord.id
        });

        for (let geyser of jsonSave.geysers) {
            console.log(`Creating geyser record for ${geyser.Name}`);
            await Geyser.create({
                saveId: saveRecord.id,
                name: geyser.Name,
                x: geyser.X,
                y: geyser.Y,
                element: geyser.Element,
                temperature: geyser.Temperature,
                emitRate: geyser.EmitRate,
                AvgEmission: geyser.AvgEmission,
                yearOffDuration: geyser.YearOffDuration,
                yearOnDuration: geyser.YearOnDuration,
                iterationLength: geyser.IterationLength,
                onDuration: geyser.OnDuration
            });
        }

        console.log("Done")
    }

    // console.log("World traits:");
    // console.log(worldTraits);
    // console.log("Geysers:");
    // console.log(geysers);
}

if (require.main === module) {
    main(process.argv[2]);
}