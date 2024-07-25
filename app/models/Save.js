const { DataTypes } = require('sequelize');
const sequelize     = require('../lib/database');

const Save = sequelize.define('Save', {
    seed: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gameVersion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // We can store these as an array, but this lets us query them easily (with more speed?)
    vanilla: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    spacedOut: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    frostyPlanet: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    
    // This is the save file itself
});

module.exports = Save;