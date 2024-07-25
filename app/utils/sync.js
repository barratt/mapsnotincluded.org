require('dotenv').config();

const sequelize = require('./database');
const File      = require('./models/File');
const Save      = require('./models/Save');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error creating database & tables:', error);
  }
};

syncDatabase();