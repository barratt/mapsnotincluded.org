require('dotenv').config();

const sequelize = require('../lib/database');
const { File, Geyser, Save } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error creating database & tables:', error);
  }
};

syncDatabase();