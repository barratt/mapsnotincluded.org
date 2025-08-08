const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
    res.redirect("https://steam.auth.stefanoltmann.de/login?redirect=https://mapsnotincluded.org");
});

module.exports = router;
