const express = require('express');

const router = express.Router();

// /coordinates/request/:id
router.get('/request/:id', async (req, res) => {

    // FIXME Send a POST request to the following endpoint:
    //  https://ingest.mapsnotincluded.org/request-coordinate
    //  with the body of the coordinate (plain text)

    return res.json({
        message: 'This is not working right now.'
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