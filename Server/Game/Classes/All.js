const Warrior = require('./Warrior');
const Mage = require('./Mage');
const Rogue = require('./Rogue');

const classes = [];
classes["warrior"] = Warrior;
classes["mage"] = Mage;
classes["rogue"] = Rogue;

module.exports = {
    classes: classes
};