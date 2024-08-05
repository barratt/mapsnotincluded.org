require('dotenv').config();
const oni = require('oni-save-parser')
const { buffer } = require('node:stream/consumers');   

console.log(process.env.S3_REGION);

const s3 = require('../lib/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const key = process.argv[2];

async function main() {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
    });
    
    console.log('Starting download');
    const response = await s3.send(command);

    console.log('Converting to buffer');
    const saveFile = (await buffer(response.Body)).buffer;
    console.log('Parsing save game');
    const save = oni.parseSaveGame(saveFile);
    console.log(`Saving result`)
    require('fs').writeFileSync(key + '.json', JSON.stringify(save, null, 2));

    console.log(save);
}

main();