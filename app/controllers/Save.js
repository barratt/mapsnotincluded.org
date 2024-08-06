const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Save  = require('../models/Save');

router.get('/', (req, res) => {
    return res.status(501);
});

router.get('/count', async (req, res) => {
    const data = Object.assign({}, req.body, req.query);

    const worldId = data.worldId;
    const query = {};

    if (worldId) {
        query.worldId = worldId;
    }

    if (data.Vanilla) query.vanilla = true;
    if (data.SpacedOut) query.spacedOut = true;
    if (data.FrostyPlanet) query.frostyPlanet = true;

    const count = await Save.count({
        where: query
    });

    return res.json({ count });
});

router.post('/search', async (req, res) => {
    const data = Object.assign(req.body, req.query);
    
    const worldId = data.worldId;
    const worldTraits = data.worldTraits; // Array , separated
    const pageSize = data.pageSize || 10;
    const page = data.page || 0;

    if (pageSize > 100) {
        return res.status(400).json({ error: 'pageSize must be less than 100' });
    } else if (page < 0) {
        return res.status(400).json({ error: 'page must be greater than or equal to 0' });
    } else if (isNaN(pageSize) || isNaN(page)) {
        return res.status(400).json({ error: 'pageSize and page must be numbers' });
    }

    const query = {};
    if (worldId) {
        query.worldId = worldId;
    }

    if (worldTraits && typeof worldTraits === 'string') {
        query.worldTraits = { [Op.contains]: worldTraits.split(',') }; // TODO: Found a typo in the DB that needs correcting... Probably better sooner than later.. (wordTraits -> worldTraits)
    } else if (worldTraits && Array.isArray(worldTraits) && worldTraits.length > 0) {
        query.worldTraits = { [Op.contains]: worldTraits };
    }

    
    if (data.Vanilla) query.vanilla = true;
    if (data.SpacedOut) query.spacedOut = true;
    if (data.FrostyPlanet) query.frostyPlanet = true;

    const saves = await Save.findAndCountAll({
        where: query,
        limit: pageSize,
        offset: page * pageSize,
        order: [[ 'createdAt', 'DESC' ]]
    });


    // TODO: Add Geyser search
    // TODO: If the search takes too long (> 5 seconds?), send back a 202 with a location header to poll for the result
    // Or perhaps always return a 202 with a location header to poll for the result...

    return res.json({ 
        saves: saves.rows,
        page,
        pageSize,
        totalPages: Math.ceil(saves.count / pageSize),
        totalResults: saves.count
    });
});

router.post('/', (req, res) => {
    // Lets upload the file to s3 and save the metadata to the database 
});

module.exports = router;