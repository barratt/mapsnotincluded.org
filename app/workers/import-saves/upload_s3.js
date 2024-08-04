require('dotenv').config();
const fs = require('fs');
const s3 = require('../../lib/s3');

const { HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const { Queue } = require('async-await-queue');
const e = require('express');
const Q = new Queue(10, 50);


const folder = process.argv[2];

async function uploadSave(folder, save) {
    const jsonFilePath = `${folder}/${save}/${save}.sav.json`;
    const saveFilePath = `${folder}/${save}/${save}.sav`;

    if (!fs.existsSync(jsonFilePath)) {
        console.log(`Save ${save} does not have a json file, skipping`);
        return;
    }

    if (!fs.existsSync(saveFilePath)) {
        console.log(`Save ${save} does not have a save file, skipping`);
        return;
    }

    const json = fs.readFileSync(jsonFilePath);
    const saveFile = fs.readFileSync(saveFilePath);

    console.log(`Uploading ${save}`);

    // We know they don't exist, so we can skip this check
    // let existsResp;
    // try {
    //     await s3.send(new HeadObjectCommand({
    //         Bucket: process.env.S3_BUCKET,
    //         Key: `${save}.sav`,
    //     }));

    //     existsResp = true;
    // } catch (error) {
    //     existsResp = false;
    //     // Or other failure do a check
    // }

    // if (existsResp) {
    //     console.log(`Save ${save} already exists, skipping`);
    //     return;
    // }

    let response;
    try {
        response = await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `${save}.sav`,
            Body: saveFile,
        }));
    } catch (error) {
        console.log(`Failed to upload ${save}`);
        throw error;
    }


    if (!response) {
        console.log(`Failed to ingest ${save}`);
    } else {
        console.log(`Ingested ${save}`);
        console.log(response);
    }
}

async function main() {
    const saves = fs.readdirSync(folder);

    console.log(`Processing ${saves.length} saves`);

    const toProcess = [];

    for (const save of saves) {
        if (save == 'auto_save') continue;

        toProcess.push(Q.run(() => uploadSave(folder, save).catch(e => console.error(`E: ${e.message}`))));
        // break;
    }

    await Promise.all(toProcess);
}

main().catch(e => console.error(`E: ${e.message}`));