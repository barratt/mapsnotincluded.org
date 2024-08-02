// This controller should facilitate the S3 upload/download process along with creating the metadata in the database.// models/File.js
const express = require('express');
const router = express.Router();

const s3 = require('../lib/s3');
const File = require('../models/File');

const authentication = require('../middleware/authentication');

router.use(authentication.authenticate);

router.get('/', (req, res) => {
    return res.status(501);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const file = await File.findByPk(id);

    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    return res.json({
        file,
        signedUrl,
    });
});

// For now we will implicitly trust the client and not validate the input.
router.post('/', async (req, res) => {
    const { filename, mimeType, size } = req.body;
    const s3Key = `${filename}-${Date.now()}`;

    const file = await File.create({
        filename,
        s3Key,
        mimeType,
        size,
    });
    
    

    return res.json({
        file,
        signedUrl,
    });
});

module.exports = router;