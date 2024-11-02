// insertDocument.js
const { MongoClient } = require('mongodb');

// Replace with your MongoDB URI
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mni';  // Change to your MongoDB URI

const client = new MongoClient(uri);

module.exports = client;