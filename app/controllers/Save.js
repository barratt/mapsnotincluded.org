const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');


const Save  = require('../models/Save');

router.get('/', (req, res) => {
    return res.status(501);
});

router.get('/count', asyncHandler(async (req, res) => {
    const worldId = req.query.worldId;
    const query = {};

    if (worldId) {
        query.worldId = worldId;
    }

    const count = await Save.count(query);

    return res.json({ count });
}));

router.get('/search', asyncHandler(async (req, res) => {
    const worldId = req.query.worldId;
    const query = {};

    if (worldId) {
        query.worldId = worldId;
    }
    
    // TODO: Add Geyser search
    // TODO: If the search takes too long, send back a 202 with a location header to poll for the result

    return res.json({ saves });
}));

router.post('/', (req, res) => {
    // Lets upload the file to s3 and save the metadata to the database 
});

module.exports = router;