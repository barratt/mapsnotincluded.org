const express = require('express');
const router = express.Router();

const Save  = require('../models/Save');

router.get('/', (req, res) => {
    
});

router.post('/', (req, res) => {
    // Lets upload the file to s3 and save the metadata to the database 
});

module.exports = router;