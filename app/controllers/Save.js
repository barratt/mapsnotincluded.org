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

    const worldTraits = req.query.worldTraits; // Array , separated
    const pageSize = req.query.pageSize || 10;
    const page = req.query.page || 0;

    if (pageSize > 100) {
        return res.status(400).json({ error: 'pageSize must be less than 100' });
    } else if (page < 0) {
        return res.status(400).json({ error: 'page must be greater than or equal to 0' });
    } else if (isNaN(pageSize) || isNaN(page)) {
        return res.status(400).json({ error: 'pageSize and page must be numbers' });
    }

    if (worldId) {
        query.worldId = worldId;
    }

    if (worldTraits) {
        query.worldTraits = { $all: worldTraits.split(',') };
    }

    const saves = await Save.findAndCountAll({
        where: query,
        limit: pageSize,
        offset: page * pageSize,
        order: [['createdAt', 'DESC']]
    });


    // TODO: Add Geyser search
    // TODO: If the search takes too long (> 5 seconds?), send back a 202 with a location header to poll for the result
    // Or perhaps always return a 202 with a location header to poll for the result...

    return res.json({ 
        saves: saves.rows,
        page,
        pageSize,
        totalPages: Math.ceil(saves.count / pageSize)
    });
}));

router.post('/', (req, res) => {
    // Lets upload the file to s3 and save the metadata to the database 
});

module.exports = router;