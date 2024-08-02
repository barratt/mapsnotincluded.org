require('dotenv').config();

const sequelize = require('./lib/database');
const { Save, File } = require('./models');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', express.static('public')); // TODO: Host UI from here perhaps?

const port = process.env.PORT || 3000;
const interface = process.env.INTERFACE || 'localhost';
const API_PREFIX = '/api';

app.use((req, res, next) => { // TODO: Proper logging
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get(`${API_PREFIX}`, (req, res) => {
  res.json({
    message: "Welcome to the MapsNotIncluded API"
  });
});

app.use(`${API_PREFIX}/saves`, require('./controllers/Save'));
app.use(`${API_PREFIX}/files`, require('./controllers/File'));
app.use(`${API_PREFIX}/ingest`, require('./controllers/Ingest'));

app.listen(port, interface, () => {
    console.log(`Server is running on port http://${interface}:${port}`);
});