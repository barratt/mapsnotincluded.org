require('dotenv').config();

const sequelize = require('./lib/database');
const { Save, File } = require('./models');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', express.static('public'));

const port = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to the MapsNotIncluded API"
  });
});

app.use('/api/saves', require('./controllers/Save'));
app.use('/api/files', require('./controllers/File'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});