const express = require('express');
const multer = require('multer');
const oniParser = require('oni-save-parser');

const router = express.Router();

const s3 = require('../lib/s3');
const { HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const { File, Save, Geyser } = require('../models'); 

const authentication = require('../middleware/authentication');

router.use(authentication.authenticate);

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const worldIDs = [
    'S-FRZ',
    'SNDST-A',
    'BAD-A', 
    'CER-A', 
    'VOLCA',
    'FRST-A',
    'HTFST-A',
    'LUSH-A',
    'OASIS-A',
    'OCAN-A',
]

router.get('/', (req, res) => {
    return res.status(501);
});

router.post('/', upload.single('save'), async (req, res) => {
    console.log("Ingesting save");
    // Multi-part form data, a file upload and json body
    const save = req.file;
    const data = JSON.parse(req.body.data); // TODO: Validate this data

    if (!save) {
        return res.status(400).json({ message: 'No save file uploaded' });
    }

    let saveData;
    try {
        saveData = await oniParser.parseSaveGame(save.buffer.buffer); // I think this is quite blocking
    } catch (e) {
        console.error(e);
        return res.status(400).json({ message: 'Invalid save file' });
    }

    const dlc = saveData.header.gameInfo.dlcId;

    if (dlc !== null) {
        console.log(`Save ${save} is not vanilla (Got ${dlc}), skipping`);
        return res.status(400).json({ message: 'Save is not vanilla' });
    }

    // TODO: Verify the coordinates contain the correct seed.
    const seed = saveData.gameData.worldDetail.globalWorldSeed;
    const coordinates = data.seed;

    let saveRecord = await Save.findOne({
        where: {
            coordinates,
        }
    });

    if (saveRecord) {
        console.log(`Save ${coordinates} already exists, skipping`);
        return res.status(200).json({ message: 'Save already exists' });
    }

    const s3Key = `${coordinates}.sav`;

    // Upload to S3 if not exits
    try {
        console.log("Checking if file exists");
        let existsResp = await s3.send(new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key
        }));

        console.log(`File ${s3Key} already exists, skipping`);
    } catch (error) {
        console.log(`Uploading file ${s3Key}`);
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: save.buffer,
        }));
    }
    
    let fileRecord = await File.findOne({
        where: {
            s3Key: s3Key,
        }
    });

    if (!fileRecord) {
        console.log(`Creating file record for ${s3Key}`);
        fileRecord = await File.create({
            filename: s3Key,
            bucket: process.env.S3_BUCKET,
            s3Key: s3Key,
            size: save.buffer.byteLength,
        });
    }
    
    const worldId = worldIDs.find(x => coordinates.startsWith(x));

    console.log(`Creating save record for ${coordinates}`);
    saveRecord = await Save.create({ // TODO: Add to the mod all of this data so we don't have to rely on the save parser project and the mod project.
        seed: saveData.gameData.worldDetail.globalWorldSeed,
        coordinates: coordinates,
        gameVersion: saveData.version.major + '.' + saveData.version.minor,
        worldId: worldId,
        vanilla: true,
        spacedOut: false,
        frostyPlanet: false,
        worldTraits: data.worldTraits.map(x => x.replace('traits/', '')),
        fileId: fileRecord.id
    });

    for (let geyser of data.geysers) {
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

    return res.json({
        success: 1, 
    });
});

module.exports = router;