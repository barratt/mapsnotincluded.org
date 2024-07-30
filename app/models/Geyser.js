const { DataTypes } = require('sequelize');
const sequelize     = require('../lib/database');
const Save          = require('./Save');

const Geyser = sequelize.define('Geyser', {
    name: { // Not really important.
        type: DataTypes.STRING,
        allowNull: false
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    element: {
        type: DataTypes.ENUM,
        values: [
            'CarbonDioxide',       'ChlorineGas',
            'Hydrogen',            'Steam',
            'DirtyWater',          'CrudeOil',
            'ContaminatedOxygen',  'Methane',
            'LiquidCarbonDioxide', 'SaltWater',
            'Magma',               'Brine',
            'MoltenCopper',        'Water',
            'MoltenIron',          'MoltenGold',
            // TODO: Add more
        ],
        allowNull: false
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    emitRate: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    AvgEmission: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    yearOffDuration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    yearOnDuration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    iterationLength: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    onDuration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
});

module.exports = Geyser;