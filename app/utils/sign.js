require('dotenv').config();

console.log(process.env.S3_REGION);

const s3 = require('../lib/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const key = process.argv[2];

const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
});

getSignedUrl(s3, command).then(console.log).catch(console.error);