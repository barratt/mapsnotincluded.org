const express = require('express');

const router = express.Router();

const mongo = require('../lib/mongo');

// /seed/request/:id
router.get('/request/:id', require('../middleware/authentication').authenticate, async (req, res) => {
    // Check if the seed is already requested

    const seed = await mongo.db(process.env.MONGO_DB || 'mni').collection('seeds').findOne({
        seed: req.params.id,
        status: 'requested',
    });
    
    if (seed) {
        return res.status(400).json({
            error: 'Seed already requested'
        });
    }


    await mongo.db(process.env.MONGO_DB || 'mni').collection('seeds').insertOne({
        requestedBy: req.user.steamid,
        requestedAt: new Date(),
        seed: req.params.id,
        status: 'requested',
    });

    return res.json({
        message: 'Seed requested'
    });
});

router.get('/:id', async (req, res) => {
    // Someone wants to get a specific seed

    // not implemented
    return res.status(501).json({
        error: 'Not implemented'
    });
});

module.exports = router;