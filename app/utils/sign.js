require('dotenv').config();
const s3 = require('./lib/s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const key = process.argv[2];

const signedUrl = getSignedUrl(s3, {
    command: 'getObject',
    params: {
        Bucket: process.env.S3_BUCKET,
        Key: key,
    },
    expiresIn: 3600,
});

console.log(signedUrl);