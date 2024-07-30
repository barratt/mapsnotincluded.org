const File = require('./File');
const Save = require('./Save');
const Geyser = require('./Geyser');

Save.hasMany(Geyser, {
    foreignKey: 'saveId'
});

Geyser.belongsTo(Save, {
    foreignKey: 'saveId'
});

// First time using sequelise, this doesn't make much sense to me as the ID is on the correct table but syntactically i would expect a save to have one file?
File.hasOne(Save, {
    foreignKey: 'fileId'
});

module.exports = {
    Geyser,
    Save,
    File,
}