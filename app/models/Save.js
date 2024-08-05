const { DataTypes } = require('sequelize');
const sequelize     = require('../lib/database');

const Save = sequelize.define('Save', {
    seed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    coordinates: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false
    },
    gameVersion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    worldId: {
        type: DataTypes.STRING,
        allowNull: true
    },
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
    wordTraits: { // Array of enums
        type: DataTypes.ARRAY(DataTypes.ENUM({
            values: [
                'BouldersMedium',
                'TrappedOil',
                'BuriedOil',
                'MetalRich',
                'BouldersMixed',
                'MagmaVents',
                'Volcanoes',
                'MetalPoor',
                'SlimeSplats',
                'BouldersLarge',
                'IrregularOil',
                'Geodes',
                'SlimeSplats',
                'FrozenCore',
                'BouldersLarge',
                'SubsurfaceOcean',
                'MisalignedStart',
                'GeoActive',
                'BouldersSmall',
                'GlaciersLarge',
                'GeoDormant',
            ]
        })),
        allowNull: false,
        
    },
    // This is the save file itself
});

module.exports = Save;

