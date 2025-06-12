const express = require('express');

const router = express.Router();

const mongo = require('../lib/mongo');

// /coordinates/request/:id
router.get('/request/:id', require('../middleware/authentication').authenticate, async (req, res) => {

    // Check if the coordinates is already requested

    const coordinates = await mongo.db(process.env.MONGO_DB || 'mni').collection('requestedCoordinates').findOne({
        coordinate: req.params.id,
    });
    
    if (coordinates) {
        return res.status(400).json({
            error: 'Coordinates already requested'
        });
    }

    await mongo.db(process.env.MONGO_DB || 'mni').collection('requestedCoordinates').insertOne(
        {
            steamId: req.user.steamId,
            date: Date.now(),
            coordinate: req.params.id,
            status: 'REQUESTED',
        }
    );

    return res.json({
        message: 'Coordinates requested'
    });
});

router.get('/:id', async (req, res) => {
    // Someone wants to get a specific coordinates

    // not implemented
    return res.status(501).json({
        error: 'Not implemented'
    });
});

module.exports = router;